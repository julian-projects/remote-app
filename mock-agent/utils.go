package main

import (
	"encoding/json"
	"os/exec"
	"runtime"
	"strings"

	"github.com/gorilla/websocket"
)

func getHardwareIDDarwin() string {
	cmd := exec.Command("ioreg", "-rd1", "-c", "IOPlatformExpertDevice")
	out, err := cmd.Output()
	if err != nil {
		return ""
	}

	// find the UUID line
	lines := strings.Split(string(out), "\n")
	for _, line := range lines {
		if strings.Contains(line, "IOPlatformUUID") {
			// extract the quoted UUID "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
			parts := strings.Split(line, "\"")
			if len(parts) > 3 {
				return strings.ToLower(strings.TrimSpace(parts[3]))
			}
		}
	}
	return ""
}

func getMachineID() string {
	osName := runtime.GOOS

	switch osName {
	case "darwin":
		return getHardwareIDDarwin()
	default:
		return ""
	}
}

func createMessage(msgType, content string) ([]byte, error) {
	messageToSend := Message{
		Type:    msgType,
		AgentId: generateDeviceID(),
		Content: content,
	}
	return json.Marshal(messageToSend)
}

func sendMessage(conn *websocket.Conn, msgType, content string) error {
	msg, err := createMessage(msgType, content)
	if err != nil {
		return err
	}
	return conn.WriteMessage(websocket.TextMessage, msg)
}
