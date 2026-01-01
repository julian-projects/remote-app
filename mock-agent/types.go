package main

type Message struct {
	Type    string `json:"type"`
	AgentId string `json:"agent_id,omitempty"`
	Content string `json:"content"`
}
