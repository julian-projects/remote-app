package main

import (
	"os"
	"os/user"
	"strings"
)

type DeviceInfo struct {
	DeviceID string
	Hostname string
	Username string
}

func generateDeviceID() string {
	// Get the hostname of the machine
	hostname, _ := os.Hostname()
	hostname = strings.ToLower(hostname)

	u, _ := user.Current()
	username := strings.ToLower(u.Username)

	return hostname + "::" + username + "::" + getMachineID()
}

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return hostname
}

func getUsername() string {
	u, err := user.Current()
	if err != nil {
		return "unknown"
	}
	return u.Username
}

var DEVICE_INFO = DeviceInfo{
	DeviceID: generateDeviceID(),
	Hostname: getHostname(),
	Username: getUsername(),
}
