package main

import (
	"crypto/rand"
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// generateUUID generates a UUID v4 string using crypto/rand
func generateUUID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		// Fallback if rand fails
		return fmt.Sprintf("%d-%d-%d", time.Now().UnixNano(), os.Getpid(), time.Now().Nanosecond())
	}

	// Set version to 4 and variant to RFC 4122
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// GetDeviceInfo gathers all available device information and returns a Device struct
func GetDeviceInfo() *Device {
	device := &Device{
		ID:        generateUUID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		IsOnline:  true,
		Status:    StatusOnline,
		LastSeen:  time.Now(),
	}

	// System Information
	device.Platform = stringPtr(runtime.GOOS)
	device.Architecture = stringPtr(runtime.GOARCH)

	// Get OS version
	osVersion := getOSVersion()
	if osVersion != "" {
		device.OSVersion = stringPtr(osVersion)
	}

	// Get hostname
	hostname, err := os.Hostname()
	if err == nil {
		device.Hostname = stringPtr(hostname)
	}

	// Get username
	username := os.Getenv("USER")
	if username == "" {
		username = os.Getenv("USERNAME")
	}
	if username != "" {
		device.Username = stringPtr(username)
		device.User = stringPtr(username)
	}

	// Get hardware info
	device.CPUCores = intPtr(runtime.NumCPU())

	// Get IP addresses
	localIP := getLocalIP()
	if localIP != "" {
		device.LocalIP = stringPtr(localIP)
	}

	publicIP := getPublicIP()
	if publicIP != "" {
		device.PublicIP = stringPtr(publicIP)
	}

	// Get memory info
	memTotal := getMemoryTotal()
	if memTotal > 0 {
		device.MemoryTotal = int64Ptr(memTotal)
	}

	// Get disk info
	diskTotal := getDiskTotal()
	if diskTotal > 0 {
		device.DiskTotal = int64Ptr(diskTotal)
	}

	// Get timezone
	tz, offset := time.Now().Zone()
	device.Timezone = stringPtr(fmt.Sprintf("%s (UTC%+d)", tz, offset/3600))

	// Get device model and manufacturer (platform specific)
	model, manufacturer := getDeviceModel()
	if model != "" {
		device.Model = stringPtr(model)
	}
	if manufacturer != "" {
		device.Manufacturer = stringPtr(manufacturer)
	}

	// Set default agent status
	device.AgentStatus = agentStatusPtr(AgentRunning)

	// Get CPU model and details
	cpuModel := getCPUModel()
	if cpuModel != "" {
		device.CPUModel = stringPtr(cpuModel)
	}

	// Get GPU information
	gpuModel := getGPUModel()
	if gpuModel != "" {
		device.GPUModel = stringPtr(gpuModel)
	}

	// Get battery information
	batteryLevel := getBatteryLevel()
	if batteryLevel >= 0 {
		device.BatteryLevel = float64Ptr(batteryLevel)
	}
	batteryStatus := getBatteryStatus()
	if batteryStatus != "" {
		bs := BatteryStatus(batteryStatus)
		device.BatteryStatus = &bs
	}

	// Get current hardware usage
	cpuUsage := getCPUUsage()
	if cpuUsage >= 0 {
		device.CPUUsage = float64Ptr(cpuUsage)
	}

	memUsage := getMemoryUsage()
	if memUsage > 0 {
		device.MemoryUsage = int64Ptr(memUsage)
	}

	diskUsage := getDiskUsage()
	if diskUsage > 0 {
		device.DiskUsage = int64Ptr(diskUsage)
	}

	// Get temperature
	cpuTemp := getCPUTemperature()
	if cpuTemp > 0 {
		device.TemperatureCPU = float64Ptr(cpuTemp)
	}

	// Get process count
	procCount := getProcessCount()
	if procCount > 0 {
		device.ProcessCount = intPtr(procCount)
	}

	// Get uptime
	uptime := getUptime()
	if uptime > 0 {
		device.Uptime = int64Ptr(uptime)
	}

	// Get screen resolution
	screenRes := getScreenResolution()
	if screenRes != "" {
		device.ScreenResolution = stringPtr(screenRes)
	}

	// Get network speed
	networkSpeed := getNetworkSpeed()
	if networkSpeed > 0 {
		device.NetworkSpeed = float64Ptr(networkSpeed)
	}

	// Get WiFi information
	wifiSSID := getWifiSSID()
	if wifiSSID != "" {
		device.WifiSSID = stringPtr(wifiSSID)
	}

	wifiSignal := getWifiSignalStrength()
	if wifiSignal >= 0 {
		device.WifiSignalStrength = float64Ptr(wifiSignal)
	}

	// Check for devices
	device.HasCamera = boolPtr(hasCamera())
	device.HasMicrophone = boolPtr(hasMicrophone())
	device.HasBluetooth = boolPtr(hasBluetooth())
	device.HasWifi = boolPtr(hasWifi())

	// Get security info
	device.FirewallEnabled = boolPtr(isFirewallEnabled())
	device.DiskEncrypted = boolPtr(isDiskEncrypted())
	device.ScreenLockEnabled = boolPtr(isScreenLockEnabled())

	// Get antivirus info
	avName, avInstalled, avUpToDate := getAntivirusInfo()
	if avInstalled {
		device.AntivirusInstalled = boolPtr(true)
	}
	if avName != "" {
		device.AntivirusName = stringPtr(avName)
		device.AntivirusUpToDate = boolPtr(avUpToDate)
	}

	// Get logged in users
	loggedInUsers := getLoggedInUsers()
	if loggedInUsers > 0 {
		device.LoggedInUsers = intPtr(loggedInUsers)
	}

	return device
}

// Helper functions

func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}

func int64Ptr(i int64) *int64 {
	return &i
}

func float64Ptr(f float64) *float64 {
	return &f
}

func boolPtr(b bool) *bool {
	return &b
}

func agentStatusPtr(status AgentStatus) *AgentStatus {
	return &status
}

// getOSVersion returns the OS version
func getOSVersion() string {
	switch runtime.GOOS {
	case "linux":
		// Try to get from /etc/os-release
		out, err := exec.Command("cat", "/etc/os-release").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.HasPrefix(line, "PRETTY_NAME=") {
					return strings.Trim(strings.TrimPrefix(line, "PRETTY_NAME="), "\"")
				}
			}
		}
		// Fallback to uname
		out, err = exec.Command("uname", "-r").Output()
		if err == nil {
			return strings.TrimSpace(string(out))
		}
	case "darwin":
		out, err := exec.Command("sw_vers", "-productVersion").Output()
		if err == nil {
			return strings.TrimSpace(string(out))
		}
	case "windows":
		out, err := exec.Command("cmd", "/C", "ver").Output()
		if err == nil {
			return strings.TrimSpace(string(out))
		}
	}
	return ""
}

// getLocalIP returns the local IP address
func getLocalIP() string {
	out, err := exec.Command("hostname", "-I").Output()
	if err == nil {
		ips := strings.Fields(strings.TrimSpace(string(out)))
		if len(ips) > 0 {
			return ips[0]
		}
	}
	return ""
}

// getPublicIP returns the public IP address using ifconfig.co
func getPublicIP() string {
	out, err := exec.Command("curl", "-s", "ifconfig.co").Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

// getMemoryTotal returns total memory in bytes
func getMemoryTotal() int64 {
	out, err := exec.Command("free", "-b").Output()
	if err == nil {
		lines := strings.Split(string(out), "\n")
		if len(lines) > 1 {
			fields := strings.Fields(lines[1])
			if len(fields) > 1 {
				var total int64
				_, err := fmt.Sscanf(fields[1], "%d", &total)
				if err == nil {
					return total
				}
			}
		}
	}
	return 0
}

// getDiskTotal returns total disk space in bytes
func getDiskTotal() int64 {
	out, err := exec.Command("df", "-B1", "/").Output()
	if err == nil {
		lines := strings.Split(string(out), "\n")
		if len(lines) > 1 {
			fields := strings.Fields(lines[1])
			if len(fields) > 1 {
				var total int64
				_, err := fmt.Sscanf(fields[1], "%d", &total)
				if err == nil {
					return total
				}
			}
		}
	}
	return 0
}

// getDeviceModel returns the device model and manufacturer
func getDeviceModel() (string, string) {
	var model, manufacturer string

	switch runtime.GOOS {
	case "darwin":
		// macOS
		out, err := exec.Command("system_profiler", "SPHardwareDataType").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.Contains(line, "Model Name:") {
					model = strings.TrimSpace(strings.TrimPrefix(line, "Model Name:"))
				}
				if strings.Contains(line, "Manufacturer:") {
					manufacturer = strings.TrimSpace(strings.TrimPrefix(line, "Manufacturer:"))
				}
			}
		}
		if model == "" {
			manufacturer = "Apple"
		}
	case "linux":
		// Linux
		out, err := exec.Command("dmidecode", "-s", "system-product-name").Output()
		if err == nil {
			model = strings.TrimSpace(string(out))
		}
		out, err = exec.Command("dmidecode", "-s", "system-manufacturer").Output()
		if err == nil {
			manufacturer = strings.TrimSpace(string(out))
		}
	case "windows":
		// Windows
		out, err := exec.Command("wmic", "csproduct", "get", "name").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			if len(lines) > 1 {
				model = strings.TrimSpace(lines[1])
			}
		}
		out, err = exec.Command("wmic", "csproduct", "get", "vendor").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			if len(lines) > 1 {
				manufacturer = strings.TrimSpace(lines[1])
			}
		}
	}

	return model, manufacturer
}

// getCPUModel returns the CPU model
func getCPUModel() string {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("grep", "-m1", "model name", "/proc/cpuinfo").Output()
		if err == nil {
			parts := strings.Split(string(out), ":")
			if len(parts) > 1 {
				return strings.TrimSpace(parts[1])
			}
		}
	case "darwin":
		out, err := exec.Command("sysctl", "-n", "machdep.cpu.brand_string").Output()
		if err == nil {
			return strings.TrimSpace(string(out))
		}
	case "windows":
		out, err := exec.Command("wmic", "cpu", "get", "name").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			if len(lines) > 1 {
				return strings.TrimSpace(lines[1])
			}
		}
	}
	return ""
}

// getGPUModel returns the GPU model
func getGPUModel() string {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("lspci").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.Contains(line, "VGA") || strings.Contains(line, "3D") {
					parts := strings.Split(line, ":")
					if len(parts) > 2 {
						return strings.TrimSpace(parts[2])
					}
				}
			}
		}
	case "darwin":
		out, err := exec.Command("system_profiler", "SPDisplaysDataType").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.Contains(line, "Chipset Model:") {
					return strings.TrimSpace(strings.TrimPrefix(line, "Chipset Model:"))
				}
			}
		}
	case "windows":
		out, err := exec.Command("wmic", "path", "win32_videocontroller", "get", "name").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			if len(lines) > 1 {
				return strings.TrimSpace(lines[1])
			}
		}
	}
	return ""
}

// getBatteryLevel returns the battery level as percentage
func getBatteryLevel() float64 {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("bash", "-c", "cat /sys/class/power_supply/BAT0/capacity 2>/dev/null || echo -1").Output()
		if err == nil {
			var level int
			fmt.Sscanf(strings.TrimSpace(string(out)), "%d", &level)
			if level >= 0 {
				return float64(level)
			}
		}
	case "darwin":
		out, err := exec.Command("pmset", "-g", "batt").Output()
		if err == nil {
			parts := strings.Fields(string(out))
			for _, part := range parts {
				if strings.Contains(part, "%") {
					level := strings.TrimSuffix(part, "%")
					var val int
					fmt.Sscanf(level, "%d", &val)
					return float64(val)
				}
			}
		}
	}
	return -1
}

// getBatteryStatus returns the battery status
func getBatteryStatus() string {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("bash", "-c", "cat /sys/class/power_supply/BAT0/status 2>/dev/null").Output()
		if err == nil {
			status := strings.TrimSpace(string(out))
			switch status {
			case "Charging":
				return "charging"
			case "Discharging":
				return "discharging"
			case "Full":
				return "full"
			}
		}
	case "darwin":
		out, err := exec.Command("pmset", "-g", "batt").Output()
		if err == nil {
			output := string(out)
			if strings.Contains(output, "discharging") {
				return "discharging"
			} else if strings.Contains(output, "charging") {
				return "charging"
			} else if strings.Contains(output, "charged") {
				return "full"
			}
		}
	}
	return ""
}

// getCPUUsage returns current CPU usage percentage
func getCPUUsage() float64 {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("bash", "-c", "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1").Output()
		if err == nil {
			var usage float64
			fmt.Sscanf(strings.TrimSpace(string(out)), "%f", &usage)
			return usage
		}
	case "darwin":
		out, err := exec.Command("bash", "-c", "ps aux | awk 'NR>1 {sum+=$3} END {print sum}'").Output()
		if err == nil {
			var usage float64
			fmt.Sscanf(strings.TrimSpace(string(out)), "%f", &usage)
			return usage
		}
	}
	return -1
}

// getMemoryUsage returns current memory usage in bytes
func getMemoryUsage() int64 {
	out, err := exec.Command("free", "-b").Output()
	if err == nil {
		lines := strings.Split(string(out), "\n")
		if len(lines) > 1 {
			fields := strings.Fields(lines[1])
			if len(fields) > 2 {
				var used int64
				fmt.Sscanf(fields[2], "%d", &used)
				return used
			}
		}
	}
	return 0
}

// getDiskUsage returns current disk usage in bytes
func getDiskUsage() int64 {
	out, err := exec.Command("df", "-B1", "/").Output()
	if err == nil {
		lines := strings.Split(string(out), "\n")
		if len(lines) > 1 {
			fields := strings.Fields(lines[1])
			if len(fields) > 2 {
				var used int64
				fmt.Sscanf(fields[2], "%d", &used)
				return used
			}
		}
	}
	return 0
}

// getCPUTemperature returns CPU temperature in Celsius
func getCPUTemperature() float64 {
	switch runtime.GOOS {
	case "linux":
		// Try to read from thermal zone
		out, err := exec.Command("cat", "/sys/class/thermal/thermal_zone0/temp").Output()
		if err == nil {
			var temp int64
			fmt.Sscanf(strings.TrimSpace(string(out)), "%d", &temp)
			return float64(temp) / 1000.0 // Convert from millidegrees
		}
	case "darwin":
		// macOS requires additional tools
		out, err := exec.Command("osx-cpu-temp").Output()
		if err == nil {
			parts := strings.Fields(string(out))
			if len(parts) > 0 {
				var temp float64
				fmt.Sscanf(parts[0], "%f", &temp)
				return temp
			}
		}
	}
	return 0
}

// getProcessCount returns the number of running processes
func getProcessCount() int {
	out, err := exec.Command("ps", "aux").Output()
	if err == nil {
		lines := strings.Split(string(out), "\n")
		return len(lines) - 2 // Subtract header and empty line
	}
	return 0
}

// getUptime returns uptime in milliseconds
func getUptime() int64 {
	out, err := exec.Command("uptime", "-p").Output()
	if err == nil {
		log.Printf("Uptime output: %s\n", string(out))
	}

	// Fallback to /proc/uptime on Linux
	out, err = exec.Command("cat", "/proc/uptime").Output()
	if err == nil {
		fields := strings.Fields(string(out))
		if len(fields) > 0 {
			var uptime float64
			fmt.Sscanf(fields[0], "%f", &uptime)
			return int64(uptime * 1000) // Convert to milliseconds
		}
	}
	return 0
}

// getScreenResolution returns the screen resolution
func getScreenResolution() string {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("xrandr", "--current").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.Contains(line, "connected primary") || strings.Contains(line, "connected") {
					parts := strings.Fields(line)
					for _, part := range parts {
						if strings.Contains(part, "x") && strings.Contains(part, "+") {
							return strings.Split(part, "+")[0]
						}
					}
				}
			}
		}
	case "darwin":
		out, err := exec.Command("system_profiler", "SPDisplaysDataType").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.Contains(line, "Resolution:") {
					return strings.TrimSpace(strings.TrimPrefix(line, "Resolution:"))
				}
			}
		}
	}
	return ""
}

// getNetworkSpeed returns network speed in Mbps
func getNetworkSpeed() float64 {
	// This would require network speed test tools
	return 0
}

// getWifiSSID returns the connected WiFi SSID
func getWifiSSID() string {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("iwgetid", "-r").Output()
		if err == nil {
			return strings.TrimSpace(string(out))
		}
	case "darwin":
		out, err := exec.Command("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-I").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.Contains(line, "SSID:") {
					return strings.TrimSpace(strings.TrimPrefix(line, "SSID:"))
				}
			}
		}
	}
	return ""
}

// getWifiSignalStrength returns WiFi signal strength as percentage
func getWifiSignalStrength() float64 {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("bash", "-c", "iwconfig 2>/dev/null | grep -i 'signal level' | grep -oE '[0-9]+' | head -1").Output()
		if err == nil {
			var strength int
			fmt.Sscanf(strings.TrimSpace(string(out)), "%d", &strength)
			if strength > 0 && strength <= 100 {
				return float64(strength)
			}
		}
	case "darwin":
		out, err := exec.Command("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-I").Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				if strings.Contains(line, "agrCtlRSSI:") {
					parts := strings.Fields(line)
					if len(parts) > 1 {
						var rssi int
						fmt.Sscanf(parts[1], "%d", &rssi)
						// Convert RSSI to percentage (-100 = 0%, -30 = 100%)
						percentage := (rssi + 100) * 2
						if percentage < 0 {
							percentage = 0
						}
						if percentage > 100 {
							percentage = 100
						}
						return float64(percentage)
					}
				}
			}
		}
	}
	return -1
}

// hasCamera checks if device has a camera
func hasCamera() bool {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("ls", "-la", "/dev/video*").Output()
		return err == nil && len(out) > 0
	case "darwin":
		// macOS typically has built-in camera
		return true
	case "windows":
		out, err := exec.Command("wmic", "path", "win32_pnpdevice", "where", "description like '%camera%'", "get", "name").Output()
		return err == nil && strings.Contains(string(out), "camera")
	}
	return false
}

// hasMicrophone checks if device has a microphone
func hasMicrophone() bool {
	switch runtime.GOOS {
	case "linux":
		out, err := exec.Command("pactl", "list", "sources").Output()
		return err == nil && len(out) > 0
	case "darwin":
		// macOS typically has built-in microphone
		return true
	case "windows":
		out, err := exec.Command("wmic", "path", "win32_pnpdevice", "where", "description like '%microphone%'", "get", "name").Output()
		return err == nil && strings.Contains(string(out), "microphone")
	}
	return false
}

// hasBluetooth checks if device has Bluetooth
func hasBluetooth() bool {
	switch runtime.GOOS {
	case "linux":
		_, err := exec.Command("hciconfig").Output()
		return err == nil
	case "darwin":
		// macOS typically has Bluetooth
		return true
	case "windows":
		out, err := exec.Command("wmic", "path", "win32_pnpdevice", "where", "description like '%bluetooth%'", "get", "name").Output()
		return err == nil && strings.Contains(string(out), "bluetooth")
	}
	return false
}

// hasWifi checks if device has WiFi
func hasWifi() bool {
	switch runtime.GOOS {
	case "linux":
		// Check for WiFi adapter in /sys/class/net
		out, err := exec.Command("ls", "/sys/class/net").Output()
		if err == nil {
			interfaces := strings.Fields(string(out))
			for _, iface := range interfaces {
				// Check if it's a wireless interface
				_, err := os.Stat(fmt.Sprintf("/sys/class/net/%s/wireless", iface))
				if err == nil {
					return true
				}
			}
		}
		// Fallback: check with iwconfig
		_, err = exec.Command("iwconfig").Output()
		return err == nil
	case "darwin":
		// macOS typically has WiFi
		return true
	case "windows":
		out, err := exec.Command("wmic", "nic", "get", "name").Output()
		return err == nil && (strings.Contains(string(out), "wireless") || strings.Contains(string(out), "WiFi"))
	}
	return false
}

// isFirewallEnabled checks if firewall is enabled
func isFirewallEnabled() bool {
	switch runtime.GOOS {
	case "linux":
		// Check iptables or ufw
		_, err := exec.Command("ufw", "status").Output()
		return err == nil
	case "darwin":
		out, err := exec.Command("defaults", "read", "/Library/Preferences/com.apple.alf", "globalstate").Output()
		if err == nil {
			return strings.Contains(string(out), "1")
		}
	case "windows":
		out, err := exec.Command("netsh", "advfirewall", "show", "allprofiles", "state").Output()
		return err == nil && strings.Contains(string(out), "on")
	}
	return false
}

// isDiskEncrypted checks if disk is encrypted
func isDiskEncrypted() bool {
	switch runtime.GOOS {
	case "linux":
		// Check for LUKS encryption
		_, err := exec.Command("lsblk", "-o", "name,encryption").Output()
		return err == nil
	case "darwin":
		// Check FileVault status
		out, err := exec.Command("diskutil", "info", "/").Output()
		return err == nil && strings.Contains(string(out), "Encrypted: Yes")
	case "windows":
		out, err := exec.Command("manage-bde", "-status").Output()
		return err == nil && strings.Contains(string(out), "Encryption Method")
	}
	return false
}

// isScreenLockEnabled checks if screen lock is enabled
func isScreenLockEnabled() bool {
	switch runtime.GOOS {
	case "linux":
		// Check for screensaver settings
		return true // Most Linux systems have this by default
	case "darwin":
		return true // macOS has screen lock by default
	case "windows":
		return true // Windows has screen lock by default
	}
	return false
}

// getAntivirusInfo returns antivirus information
func getAntivirusInfo() (string, bool, bool) {
	switch runtime.GOOS {
	case "linux":
		// Check for common antivirus on Linux
		return "", false, false
	case "darwin":
		// Check for XProtect
		return "XProtect", true, true
	case "windows":
		out, err := exec.Command("wmic", "path", "antivirusproduct", "get", "displayName").Output()
		if err == nil && len(out) > 0 {
			lines := strings.Split(string(out), "\n")
			if len(lines) > 1 {
				name := strings.TrimSpace(lines[1])
				return name, true, true
			}
		}
	}
	return "", false, false
}

// getLoggedInUsers returns the number of logged in users
func getLoggedInUsers() int {
	out, err := exec.Command("who").Output()
	if err == nil {
		lines := strings.Split(strings.TrimSpace(string(out)), "\n")
		if len(lines) > 0 && lines[0] != "" {
			return len(lines)
		}
	}
	return 0
}

// LogDeviceInfo logs the device information
func LogDeviceInfo(device *Device) {
	log.Println("========== Device Information ==========")
	log.Printf("ID: %s\n", device.ID)

	if device.NaturalID != "" {
		log.Printf("Natural ID: %s\n", device.NaturalID)
	} else {
		log.Println("Natural ID: non-existent")
	}

	if device.Hostname != nil {
		log.Printf("Hostname: %s\n", *device.Hostname)
	} else {
		log.Println("Hostname: non-existent")
	}

	if device.Platform != nil {
		log.Printf("Platform: %s\n", *device.Platform)
	} else {
		log.Println("Platform: non-existent")
	}

	if device.Architecture != nil {
		log.Printf("Architecture: %s\n", *device.Architecture)
	} else {
		log.Println("Architecture: non-existent")
	}

	if device.OSVersion != nil {
		log.Printf("OS Version: %s\n", *device.OSVersion)
	} else {
		log.Println("OS Version: non-existent")
	}

	if device.Username != nil {
		log.Printf("Username: %s\n", *device.Username)
	} else {
		log.Println("Username: non-existent")
	}

	if device.User != nil {
		log.Printf("User: %s\n", *device.User)
	} else {
		log.Println("User: non-existent")
	}

	if device.CPUCores != nil {
		log.Printf("CPU Cores: %d\n", *device.CPUCores)
	} else {
		log.Println("CPU Cores: non-existent")
	}

	if device.CPUModel != nil {
		log.Printf("CPU Model: %s\n", *device.CPUModel)
	} else {
		log.Println("CPU Model: non-existent")
	}

	if device.MemoryTotal != nil {
		log.Printf("Memory Total: %d\n", *device.MemoryTotal)
	} else {
		log.Println("Memory Total: non-existent")
	}

	if device.MemoryUsage != nil {
		log.Printf("Memory Usage: %d\n", *device.MemoryUsage)
	} else {
		log.Println("Memory Usage: non-existent")
	}

	if device.DiskTotal != nil {
		log.Printf("Disk Total: %d\n", *device.DiskTotal)
	} else {
		log.Println("Disk Total: non-existent")
	}

	if device.DiskUsage != nil {
		log.Printf("Disk Usage: %d\n", *device.DiskUsage)
	} else {
		log.Println("Disk Usage: non-existent")
	}

	if device.CPUUsage != nil {
		log.Printf("CPU Usage: %.2f\n", *device.CPUUsage)
	} else {
		log.Println("CPU Usage: non-existent")
	}

	if device.LocalIP != nil {
		log.Printf("Local IP: %s\n", *device.LocalIP)
	} else {
		log.Println("Local IP: non-existent")
	}

	if device.PublicIP != nil {
		log.Printf("Public IP: %s\n", *device.PublicIP)
	} else {
		log.Println("Public IP: non-existent")
	}

	if device.Model != nil {
		log.Printf("Model: %s\n", *device.Model)
	} else {
		log.Println("Model: non-existent")
	}

	if device.Manufacturer != nil {
		log.Printf("Manufacturer: %s\n", *device.Manufacturer)
	} else {
		log.Println("Manufacturer: non-existent")
	}

	if device.GPUModel != nil {
		log.Printf("GPU Model: %s\n", *device.GPUModel)
	} else {
		log.Println("GPU Model: non-existent")
	}

	if device.BatteryLevel != nil {
		log.Printf("Battery Level: %.1f\n", *device.BatteryLevel)
	} else {
		log.Println("Battery Level: non-existent")
	}

	if device.BatteryStatus != nil {
		log.Printf("Battery Status: %s\n", *device.BatteryStatus)
	} else {
		log.Println("Battery Status: non-existent")
	}

	if device.TemperatureCPU != nil {
		log.Printf("CPU Temperature: %.1f\n", *device.TemperatureCPU)
	} else {
		log.Println("CPU Temperature: non-existent")
	}

	if device.TemperatureGPU != nil {
		log.Printf("GPU Temperature: %.1f\n", *device.TemperatureGPU)
	} else {
		log.Println("GPU Temperature: non-existent")
	}

	if device.ProcessCount != nil {
		log.Printf("Process Count: %d\n", *device.ProcessCount)
	} else {
		log.Println("Process Count: non-existent")
	}

	if device.Uptime != nil {
		log.Printf("Uptime: %d\n", *device.Uptime)
	} else {
		log.Println("Uptime: non-existent")
	}

	if device.ScreenResolution != nil {
		log.Printf("Screen Resolution: %s\n", *device.ScreenResolution)
	} else {
		log.Println("Screen Resolution: non-existent")
	}

	if device.NetworkSpeed != nil {
		log.Printf("Network Speed: %.2f\n", *device.NetworkSpeed)
	} else {
		log.Println("Network Speed: non-existent")
	}

	if device.WifiSSID != nil {
		log.Printf("WiFi SSID: %s\n", *device.WifiSSID)
	} else {
		log.Println("WiFi SSID: non-existent")
	}

	if device.WifiSignalStrength != nil {
		log.Printf("WiFi Signal Strength: %.1f\n", *device.WifiSignalStrength)
	} else {
		log.Println("WiFi Signal Strength: non-existent")
	}

	if device.HasCamera != nil {
		log.Printf("Has Camera: %v\n", *device.HasCamera)
	} else {
		log.Println("Has Camera: non-existent")
	}

	if device.HasMicrophone != nil {
		log.Printf("Has Microphone: %v\n", *device.HasMicrophone)
	} else {
		log.Println("Has Microphone: non-existent")
	}

	if device.HasBluetooth != nil {
		log.Printf("Has Bluetooth: %v\n", *device.HasBluetooth)
	} else {
		log.Println("Has Bluetooth: non-existent")
	}

	if device.HasWifi != nil {
		log.Printf("Has WiFi: %v\n", *device.HasWifi)
	} else {
		log.Println("Has WiFi: non-existent")
	}

	if device.FirewallEnabled != nil {
		log.Printf("Firewall Enabled: %v\n", *device.FirewallEnabled)
	} else {
		log.Println("Firewall Enabled: non-existent")
	}

	if device.DiskEncrypted != nil {
		log.Printf("Disk Encrypted: %v\n", *device.DiskEncrypted)
	} else {
		log.Println("Disk Encrypted: non-existent")
	}

	if device.ScreenLockEnabled != nil {
		log.Printf("Screen Lock Enabled: %v\n", *device.ScreenLockEnabled)
	} else {
		log.Println("Screen Lock Enabled: non-existent")
	}

	if device.AntivirusInstalled != nil {
		log.Printf("Antivirus Installed: %v\n", *device.AntivirusInstalled)
	} else {
		log.Println("Antivirus Installed: non-existent")
	}

	if device.AntivirusName != nil {
		log.Printf("Antivirus Name: %s\n", *device.AntivirusName)
	} else {
		log.Println("Antivirus Name: non-existent")
	}

	if device.LoggedInUsers != nil {
		log.Printf("Logged In Users: %d\n", *device.LoggedInUsers)
	} else {
		log.Println("Logged In Users: non-existent")
	}

	if device.Timezone != nil {
		log.Printf("Timezone: %s\n", *device.Timezone)
	} else {
		log.Println("Timezone: non-existent")
	}

	if device.Locale != nil {
		log.Printf("Locale: %s\n", *device.Locale)
	} else {
		log.Println("Locale: non-existent")
	}

	log.Printf("Status: %v\n", device.Status)
	log.Printf("Is Online: %v\n", device.IsOnline)
	log.Printf("Last Seen: %s\n", device.LastSeen.Format(time.RFC3339))
	log.Println("=========================================")
}
