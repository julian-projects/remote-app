package main

import (
	"time"

	"github.com/lib/pq"
)

// DeviceStatus represents the status of a device
type DeviceStatus string

const (
	StatusOffline        DeviceStatus = "offline"
	StatusOnline         DeviceStatus = "online"
	StatusLostConnection DeviceStatus = "lost_connection"
)

// DiskType represents the type of disk
type DiskType string

const (
	DiskTypeSSD  DiskType = "ssd"
	DiskTypeHDD  DiskType = "hdd"
	DiskTypeNVMe DiskType = "nvme"
)

// BatteryStatus represents the battery status
type BatteryStatus string

const (
	BatteryCharging    BatteryStatus = "charging"
	BatteryDischarging BatteryStatus = "discharging"
	BatteryFull        BatteryStatus = "full"
)

// ConnectionQuality represents the connection quality
type ConnectionQuality string

const (
	QualityExcellent ConnectionQuality = "excellent"
	QualityGood      ConnectionQuality = "good"
	QualityFair      ConnectionQuality = "fair"
	QualityPoor      ConnectionQuality = "poor"
)

// AgentStatus represents the agent status
type AgentStatus string

const (
	AgentRunning AgentStatus = "running"
	AgentStopped AgentStatus = "stopped"
	AgentError   AgentStatus = "error"
)

// Device represents a device in the system
type Device struct {
	// Identification
	ID           string  `gorm:"primaryKey;column:id"`
	NaturalID    string  `gorm:"uniqueIndex;column:naturalId"`
	SerialNumber *string `gorm:"column:serialNumber"`
	MacAddress   *string `gorm:"column:macAddress"`

	// System Information
	Platform      *string `gorm:"column:platform"`
	OSVersion     *string `gorm:"column:osVersion"`
	OSBuild       *string `gorm:"column:osBuild"`
	Architecture  *string `gorm:"column:architecture"`
	Model         *string `gorm:"column:model"`
	Manufacturer  *string `gorm:"column:manufacturer"`
	DeviceType    *string `gorm:"column:deviceType"`
	BIOSVersion   *string `gorm:"column:biosVersion"`
	KernelVersion *string `gorm:"column:kernelVersion"`
	Timezone      *string `gorm:"column:timezone"`
	Locale        *string `gorm:"column:locale"`

	// Hardware Specifications (static)
	CPUModel         *string   `gorm:"column:cpuModel"`
	CPUCores         *int      `gorm:"column:cpuCores"`
	CPUThreads       *int      `gorm:"column:cpuThreads"`
	CPUFrequency     *int      `gorm:"column:cpuFrequency"` // MHz
	MemoryTotal      *int64    `gorm:"column:memoryTotal"`  // bytes
	DiskTotal        *int64    `gorm:"column:diskTotal"`    // bytes
	DiskType         *DiskType `gorm:"column:diskType"`
	GPUModel         *string   `gorm:"column:gpuModel"`
	GPUMemory        *int64    `gorm:"column:gpuMemory"` // bytes
	ScreenResolution *string   `gorm:"column:screenResolution"`
	HasCamera        *bool     `gorm:"column:hasCamera"`
	HasMicrophone    *bool     `gorm:"column:hasMicrophone"`
	HasBluetooth     *bool     `gorm:"column:hasBluetooth"`
	HasWifi          *bool     `gorm:"column:hasWifi"`

	// User Information
	Username      *string `gorm:"column:username"`
	User          *string `gorm:"column:user"`
	UserFullName  *string `gorm:"column:userFullName"`
	UserEmail     *string `gorm:"column:userEmail"`
	IsAdmin       *bool   `gorm:"column:isAdmin"`
	LoggedInUsers *int    `gorm:"column:loggedInUsers"`

	// Agent Information
	AgentVersion   *string      `gorm:"column:agentVersion"`
	AgentAutoStart *bool        `gorm:"column:agentAutoStart"`
	AgentStatus    *AgentStatus `gorm:"column:agentStatus"`

	// Security & Compliance
	AntivirusInstalled *bool      `gorm:"column:antivirusInstalled"`
	AntivirusName      *string    `gorm:"column:antivirusName"`
	AntivirusUpToDate  *bool      `gorm:"column:antivirusUpToDate"`
	DiskEncrypted      *bool      `gorm:"column:diskEncrypted"`
	ScreenLockEnabled  *bool      `gorm:"column:screenLockEnabled"`
	FirewallEnabled    *bool      `gorm:"column:firewallEnabled"`
	LastSecurityUpdate *time.Time `gorm:"column:lastSecurityUpdate"`

	// Network Information (real-time)
	Hostname           *string  `gorm:"column:hostname"`
	PublicIP           *string  `gorm:"column:publicIp"`
	LocalIP            *string  `gorm:"column:localIp"`
	NetworkSpeed       *float64 `gorm:"column:networkSpeed"` // Mbps
	WifiSSID           *string  `gorm:"column:wifiSsid"`
	WifiSignalStrength *float64 `gorm:"column:wifiSignalStrength"` // percentage
	EthernetConnected  *bool    `gorm:"column:ethernetConnected"`
	NetworkBytesIn     *int64   `gorm:"column:networkBytesIn"`
	NetworkBytesOut    *int64   `gorm:"column:networkBytesOut"`

	// Hardware Usage (real-time)
	CPUUsage       *float64       `gorm:"column:cpuUsage"`     // 0–100 (%)
	MemoryUsage    *int64         `gorm:"column:memoryUsage"`  // bytes
	DiskUsage      *int64         `gorm:"column:diskUsage"`    // bytes
	BatteryLevel   *float64       `gorm:"column:batteryLevel"` // 0-100 (%)
	BatteryStatus  *BatteryStatus `gorm:"column:batteryStatus"`
	TemperatureCPU *float64       `gorm:"column:temperatureCpu"` // Celsius
	TemperatureGPU *float64       `gorm:"column:temperatureGpu"` // Celsius

	// Connection Status (real-time)
	IsOnline          bool               `gorm:"default:false;column:isOnline"`
	Status            DeviceStatus       `gorm:"default:'offline';column:status"`
	LastSeen          time.Time          `gorm:"column:lastSeen"`
	Uptime            *int64             `gorm:"column:uptime"` // milliseconds
	BootTime          *time.Time         `gorm:"column:bootTime"`
	LastReboot        *time.Time         `gorm:"column:lastReboot"`
	ConnectionQuality *ConnectionQuality `gorm:"column:connectionQuality"`

	// Performance Metrics (real-time)
	AvgCPUUsage24h    *float64 `gorm:"column:avgCpuUsage24h"`
	AvgMemoryUsage24h *float64 `gorm:"column:avgMemoryUsage24h"`
	ProcessCount      *int     `gorm:"column:processCount"`

	// Additional Info
	Notes      *string        `gorm:"column:notes"`
	Tags       pq.StringArray `gorm:"type:text[];column:tags"`
	Location   *string        `gorm:"column:location"`
	Department *string        `gorm:"column:department"`

	// Timestamps
	CreatedAt time.Time `gorm:"column:createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt"`
}

// TableName specifies the table name for Device model
func (Device) TableName() string {
	return "devices"
}
