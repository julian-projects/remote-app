package main

import (
	"log"
	"os"
)

var isDev bool

func init() {
	// Check if running in dev mode (default to true if not explicitly set to "false")
	isDev = os.Getenv("DEV_MODE") != "false"
}

// DevLog prints only in dev mode
func DevLog(v ...interface{}) {
	if isDev {
		log.Println(v...)
	}
}

// DevLogf prints formatted output only in dev mode
func DevLogf(format string, v ...interface{}) {
	if isDev {
		log.Printf(format, v...)
	}
}
