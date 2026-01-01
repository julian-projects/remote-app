package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

var DB *gorm.DB

// corsMiddleware wraps handlers to add CORS headers
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func main() {
	settings := &Settings{}
	utils := &Utils{}

	// Connect to PostgreSQL database using GORM
	dsn := "host=localhost user=rebecca password=123456789 dbname=unity_link port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	DB = db

	// Check if /user_id file already exists
	userIDData, err := os.ReadFile("/user_id")
	if err == nil {
		// File exists, use the existing device ID
		existingID := string(userIDData)
		log.Printf("Using existing device ID from /user_id: %s\n", existingID)

		// Retrieve existing device from database
		var existingDevice Device
		if result := DB.First(&existingDevice, "id = ?", existingID); result.Error != nil {
			log.Printf("Warning: Could not find existing device in database: %v\n", result.Error)
		} else {
			log.Printf("Loaded existing device from database\n")
			// LogDeviceInfo(&existingDevice)
		}
	} else {
		// File does not exist, create new device
		currentDevice := GetDeviceInfo()
		// LogDeviceInfo(currentDevice)

		// Insert device into the database
		if result := DB.Create(currentDevice); result.Error != nil {
			log.Printf("Warning: Could not insert device into database: %v\n", result.Error)
		} else {
			log.Printf("Device successfully inserted into database with ID: %s\n", currentDevice.ID)

			// Create /user_id file with device ID
			err := os.WriteFile("/user_id", []byte(currentDevice.ID), 0644)
			if err != nil {
				log.Printf("Warning: Could not create /user_id file: %v\n", err)
			} else {
				log.Printf("User ID file created at /user_id\n")
			}
		}
	}

	http.HandleFunc("/verify_id", corsMiddleware(utils.verifyIDHandler))
	http.HandleFunc("/ws", corsMiddleware(utils.wsHandler))
	http.HandleFunc("/shutdown/", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		settings.Shutdown(w, r)
	}))
	http.HandleFunc("/restart/", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		settings.Restart(w, r)
	}))
	http.HandleFunc("/format/", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		settings.Format(w, r)
	}))

	port := ":8585"
	// log.Printf("Server starting on %s\n", port)
	// log.Printf("HTTP endpoint: http://localhost%s/receive\n", port)
	// log.Printf("Verify ID endpoint: http://localhost%s/verify_id\n", port)
	// log.Printf("WebSocket endpoint: ws://localhost%s/ws\n", port)
	// log.Printf("Shutdown endpoint: http://localhost%s/shutdown\n", port)
	// log.Printf("Restart endpoint: http://localhost%s/restart\n", port)
	// log.Printf("Format endpoint: http://localhost%s/format\n", port)

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server error: %v\n", err)
	}
}
