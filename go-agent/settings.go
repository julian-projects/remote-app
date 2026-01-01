package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

// Settings handles device settings operations
type Settings struct{}

// Shutdown handles POST requests to shutdown the device
func (s *Settings) Shutdown(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	deviceID := strings.TrimPrefix(r.URL.Path, "/shutdown/")
	if deviceID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  "Missing device_id in URL",
		})
		return
	}

	log.Println("===== SHUTDOWN REQUESTED =====")
	log.Printf("Device ID: %s\n", deviceID)
	log.Println("Action: Shutdown device")
	log.Println("Status: Logging only - no action taken yet")
	log.Println("==============================")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Shutdown request logged (no action taken)",
	})
}

// Restart handles POST requests to restart the device
func (s *Settings) Restart(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	deviceID := strings.TrimPrefix(r.URL.Path, "/restart/")
	if deviceID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  "Missing device_id in URL",
		})
		return
	}

	log.Println("===== RESTART REQUESTED =====")
	log.Printf("Device ID: %s\n", deviceID)
	log.Println("Action: Restart device")
	log.Println("Status: Logging only - no action taken yet")
	log.Println("=============================")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Restart request logged (no action taken)",
	})
}

// Format handles POST requests to format the device storage
func (s *Settings) Format(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	deviceID := strings.TrimPrefix(r.URL.Path, "/format/")
	if deviceID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  "Missing device_id in URL",
		})
		return
	}

	log.Println("===== FORMAT REQUESTED =====")
	log.Printf("Device ID: %s\n", deviceID)
	log.Println("Action: Format device storage")
	log.Println("Status: Logging only - no action taken yet")
	log.Println("=============================")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Format request logged (no action taken)",
	})
}
