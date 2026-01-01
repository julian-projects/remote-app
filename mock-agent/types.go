package main

type Message struct {
	Type     string `json:"type"`
	DeviceId string `json:"deviceId,omitempty"`
	Content  string `json:"content"`
}
