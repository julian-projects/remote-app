package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/gorilla/websocket"
)

type Utils struct{}

// verifyIDHandler handles device ID verification requests
func (u *Utils) verifyIDHandler(w http.ResponseWriter, r *http.Request) {
	// Only accept POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body
	var verifyReq map[string]string
	if err := json.NewDecoder(r.Body).Decode(&verifyReq); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Get provided user_id
	providedID := verifyReq["user_id"]
	if providedID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  "Missing user_id in request",
		})
		return
	}

	// Get current user
	currentUser := os.Getenv("USER")
	if currentUser == "" {
		currentUser = os.Getenv("LOGNAME")
	}

	// Read user_id from file
	userIDPath := filepath.Join("/user_id")
	userIDBytes, err := os.ReadFile(userIDPath)
	if err != nil {
		log.Printf("Error: Could not read user_id file at %s: %v\n", userIDPath, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  "Failed to read device ID",
		})
		return
	}

	deviceID := strings.TrimSpace(string(userIDBytes))
	if deviceID == "" {
		log.Printf("Error: user_id file is empty at %s\n", userIDPath)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  "Device ID is empty",
		})
		return
	}

	// Verify the IDs match
	if providedID != deviceID {
		log.Printf("Warning: Device ID mismatch. Expected %s, got %s\n", deviceID, providedID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  "Device ID mismatch",
		})
		return
	}

	// Success
	log.Printf("Device verified successfully (ID: %s)\n", deviceID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"user":    currentUser,
		"user_id": deviceID,
	})
}

// wsHandler handles WebSocket connections
func (u *Utils) wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v\n", err)
		return
	}
	defer conn.Close()

	log.Println("WebSocket client connected")

	// Initialize session with current working directory
	session := &AgentSession{
		currentDir: os.ExpandEnv("$HOME"),
	}

	// Send initial prompt
	initialPrompt := u.generatePrompt(session.currentDir)
	if err := conn.WriteJSON(map[string]string{"prompt": initialPrompt}); err != nil {
		log.Printf("Error writing initial prompt: %v\n", err)
		return
	}

	for {
		var payload ReceivePayload
		err := conn.ReadJSON(&payload)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v\n", err)
			}
			break
		}

		log.Printf("Received event: %s\n", payload.Event)
		log.Printf("Data: %s\n", string(payload.Data))

		// Handle command execution
		if payload.Event == "command" {
			response := u.executeCommandWithSession(payload.Data, session)
			if err := conn.WriteJSON(response); err != nil {
				log.Printf("Error writing response: %v\n", err)
				break
			}
		} else {
			// Send acknowledgment for other events
			ack := map[string]string{
				"status":  "success",
				"message": fmt.Sprintf("Received event: %s", payload.Event),
			}
			if err := conn.WriteJSON(ack); err != nil {
				log.Printf("Error writing response: %v\n", err)
				break
			}
		}
	}

	log.Println("WebSocket client disconnected")
}

// executeCommandWithSession executes a command in the context of a session
// This maintains directory state and executes commands through a shell
func (u *Utils) executeCommandWithSession(data json.RawMessage, session *AgentSession) CommandResponse {
	var cmdReq CommandRequest
	response := CommandResponse{Status: "success"}

	if err := json.Unmarshal(data, &cmdReq); err != nil {
		response.Status = "error"
		response.Error = "Invalid command request"
		response.Prompt = u.generatePrompt(session.currentDir)
		return response
	}

	cmdStr := strings.TrimSpace(cmdReq.Command)
	if cmdStr == "" {
		response.Status = "error"
		response.Error = "Empty command"
		response.Prompt = u.generatePrompt(session.currentDir)
		return response
	}

	// Handle cd command specially
	parts := strings.Fields(cmdStr)
	if len(parts) > 0 && parts[0] == "cd" {
		var newDir string
		if len(parts) == 1 {
			// cd with no args goes to home
			newDir = os.ExpandEnv("$HOME")
		} else {
			newDir = parts[1]
			// Handle ~ expansion
			if strings.HasPrefix(newDir, "~") {
				home := os.ExpandEnv("$HOME")
				newDir = strings.Replace(newDir, "~", home, 1)
			}

			// Handle relative paths
			if !strings.HasPrefix(newDir, "/") {
				newDir = filepath.Join(session.currentDir, newDir)
			}
		}

		// Clean up the path to resolve .. and .
		newDir = filepath.Clean(newDir)

		// Check if directory exists
		info, err := os.Stat(newDir)
		if err != nil || !info.IsDir() {
			response.Status = "error"
			response.Error = fmt.Sprintf("cd: no such file or directory: %s", parts[1])
			response.Prompt = u.generatePrompt(session.currentDir)
			return response
		}

		session.currentDir = newDir
		// Return current directory in a JSON-friendly format
		homeDir := os.ExpandEnv("$HOME")
		displayDir := newDir
		if newDir == homeDir {
			displayDir = "~"
		} else if strings.HasPrefix(newDir, homeDir+"/") {
			// If inside home directory, show relative path with ~
			displayDir = "~" + strings.TrimPrefix(newDir, homeDir)
		}
		response.Output = ""
		response.Dir = displayDir
		response.Prompt = u.generatePrompt(session.currentDir)
		log.Printf("CD: Set currentDir=%s, displayDir=%s\n", newDir, displayDir)
		return response
	}

	// Handle pwd command specially
	if len(parts) > 0 && parts[0] == "pwd" {
		// Execute pwd through shell to preserve any switches
		cmd := exec.Command("sh", "-c", cmdStr)
		cmd.Dir = session.currentDir

		output, err := cmd.CombinedOutput()
		response.Output = string(output)

		if err != nil {
			response.Status = "error"
			response.Error = err.Error()
		}

		response.Prompt = u.generatePrompt(session.currentDir)
		return response
	}

	// Handle ls command specially to format with bullet points
	if len(parts) > 0 && parts[0] == "ls" {
		// Execute ls through shell to preserve all switches and arguments
		cmd := exec.Command("sh", "-c", cmdStr)
		cmd.Dir = session.currentDir

		output, err := cmd.CombinedOutput()
		response.Output = string(output)

		if err != nil {
			response.Status = "error"
			response.Error = err.Error()
		}

		response.Prompt = u.generatePrompt(session.currentDir)
		return response
	}

	// Execute other commands through shell with current directory
	var cmd *exec.Cmd
	if os.Getenv("SHELL") != "" {
		cmd = exec.Command(os.Getenv("SHELL"), "-c", cmdStr)
	} else {
		// Fallback to sh on Unix or cmd on Windows
		cmd = exec.Command("sh", "-c", cmdStr)
	}

	// Set the working directory
	cmd.Dir = session.currentDir

	output, err := cmd.CombinedOutput()
	response.Output = string(output)

	if err != nil {
		response.Status = "error"
		response.Error = err.Error()
	}

	response.Prompt = u.generatePrompt(session.currentDir)
	return response
}

// generatePrompt generates a shell prompt showing the current user and directory
func (u *Utils) generatePrompt(currentDir string) string {
	user := os.Getenv("USER")
	if user == "" {
		user = "user"
	}

	hostname, err := os.Hostname()
	if err != nil || hostname == "" {
		hostname = "computer"
	}

	homeDir := os.ExpandEnv("$HOME")
	displayDir := currentDir
	if currentDir == homeDir {
		displayDir = "~"
	} else if strings.HasPrefix(currentDir, homeDir+"/") {
		displayDir = "~" + strings.TrimPrefix(currentDir, homeDir)
	}

	return fmt.Sprintf("%s@%s:%s$ ", user, hostname, displayDir)
}
