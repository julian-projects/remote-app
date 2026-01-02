package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
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

func getHardwareIDLinux() string {
	// Try multiple methods to get a unique hardware ID on Linux

	// Method 1: Try reading from /etc/machine-id (systemd)
	machineIDPath := "/etc/machine-id"
	if out, err := exec.Command("cat", machineIDPath).Output(); err == nil {
		return strings.TrimSpace(string(out))
	}

	// Method 2: Try reading from /var/lib/dbus/machine-id (older systems)
	dbusMachineIDPath := "/var/lib/dbus/machine-id"
	if out, err := exec.Command("cat", dbusMachineIDPath).Output(); err == nil {
		return strings.TrimSpace(string(out))
	}

	// Method 3: Use hwinfo command to get hardware UUID
	if out, err := exec.Command("hwinfo", "--uuid").Output(); err == nil {
		return strings.TrimSpace(string(out))
	}

	// Method 4: Fallback to hostname + system UUID (if available)
	if out, err := exec.Command("hostid").Output(); err == nil {
		return strings.TrimSpace(string(out))
	}

	return ""
}

func getMachineID() string {
	osName := runtime.GOOS

	switch osName {
	case "darwin":
		return getHardwareIDDarwin()
	case "linux":
		return getHardwareIDLinux()
	default:
		return ""
	}
}

func createMessage(msgType, content string) ([]byte, error) {
	deviceID := generateDeviceID()
	DevLogf("Creating message with deviceId: %s", deviceID)
	messageToSend := Message{
		Type:     msgType,
		DeviceId: deviceID,
		Content:  content,
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

func executeCommand(command string) string {
	cmd := exec.Command("sh", "-c", command)
	cmd.Dir = currentWorkingDir
	out, err := cmd.CombinedOutput()
	if err != nil {
		DevLogf("Command execution error: %v", err)
		DevLogf("Working directory: %s", currentWorkingDir)
		DevLogf("Command: %s", command)
		return "Error executing command: " + err.Error()
	}

	output := strings.TrimSpace(string(out))

	// Check if the command was a cd command
	if strings.HasPrefix(strings.TrimSpace(command), "cd ") {
		// Extract the path from the cd command
		parts := strings.Fields(command)
		if len(parts) >= 2 {
			newPath := strings.Join(parts[1:], " ")
			// Resolve the path relative to current directory
			if !strings.HasPrefix(newPath, "/") {
				newPath = filepath.Join(currentWorkingDir, newPath)
			}
			// Clean up the path
			newPath = filepath.Clean(newPath)
			// Check if directory exists
			if info, err := os.Stat(newPath); err == nil && info.IsDir() {
				currentWorkingDir = newPath
				return "Changed directory to: " + newPath
			} else {
				return "Error: directory not found"
			}
		}
	}

	return output
}
