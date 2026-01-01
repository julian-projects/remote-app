package main

import "encoding/json"

// ReceivePayload represents the data structure for incoming requests
type ReceivePayload struct {
	Event     string          `json:"event"`
	Data      json.RawMessage `json:"data"`
	Timestamp string          `json:"timestamp,omitempty"`
}

// CommandRequest represents a command execution request
type CommandRequest struct {
	Command string `json:"command"`
}

// CommandResponse represents the response from command execution
type CommandResponse struct {
	Status string `json:"status"`
	Output string `json:"output"`
	Error  string `json:"error,omitempty"`
	Dir    string `json:"dir,omitempty"`    // Current directory for cd commands
	Prompt string `json:"prompt,omitempty"` // Shell prompt after command execution
}

// AgentSession maintains the state for a client session
type AgentSession struct {
	currentDir string
}
