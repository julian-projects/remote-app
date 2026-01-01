import { TabsContent } from '@/components/ui/tabs';
import {
    Globe,
    User,
    Laptop,
    Cpu,
    HardDrive,
    MemoryStick,
    Tag,
    Info,
    BatteryFull,
    Wifi,
    Network,
    Shield,
    Thermometer,
    Activity,
    Clock,
    Building2,
    Mail,
    MapPin,
    Gauge,
    Monitor,
    Camera,
    Mic,
    Bluetooth,
} from 'lucide-react';
import type { FunctionComponent } from 'react';
import type { IProps } from './InfoTab.types';

export const InfoTab: FunctionComponent<IProps> = ({ device }) => {
    return (
        <TabsContent value="info" className="space-y-6 mt-6">
            {/* System Information */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    System Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Operating System
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {device.osVersion ?? device.platform}
                            </p>
                        </div>
                    </div>

                    {device.osBuild && (
                        <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">OS Build</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.osBuild}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.architecture && (
                        <div className="flex items-center gap-3">
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Architecture
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.architecture}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.kernelVersion && (
                        <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Kernel Version
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.kernelVersion}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.biosVersion && (
                        <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    BIOS Version
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.biosVersion}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.timezone && (
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Timezone</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.timezone}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hardware Information */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Hardware
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {device.model && (
                        <div className="flex items-center gap-3">
                            <Laptop className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Model</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.model}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.manufacturer && (
                        <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Manufacturer
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.manufacturer}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.deviceType && (
                        <div className="flex items-center gap-3">
                            <Monitor className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Device Type
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.deviceType}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.serialNumber && (
                        <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Serial Number
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.serialNumber}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.macAddress && (
                        <div className="flex items-center gap-3">
                            <Network className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    MAC Address
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.macAddress}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.screenResolution && (
                        <div className="flex items-center gap-3">
                            <Monitor className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Screen Resolution
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.screenResolution}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CPU & Memory */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Processor & Memory
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {device.cpuModel && (
                        <div className="flex items-center gap-3">
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">CPU Model</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.cpuModel}
                                </p>
                            </div>
                        </div>
                    )}

                    {(device.cpuCores || device.cpuThreads) && (
                        <div className="flex items-center gap-3">
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    CPU Cores/Threads
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.cpuCores} cores /{' '}
                                    {device.cpuThreads} threads
                                </p>
                            </div>
                        </div>
                    )}

                    {device.cpuFrequency && (
                        <div className="flex items-center gap-3">
                            <Gauge className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    CPU Frequency
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.cpuFrequency} MHz
                                </p>
                            </div>
                        </div>
                    )}

                    {device.cpuUsage !== undefined && (
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">CPU Usage</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.cpuUsage}%
                                </p>
                            </div>
                        </div>
                    )}

                    {(device.memoryUsage || device.memoryTotal) && (
                        <div className="flex items-center gap-3">
                            <MemoryStick className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Memory</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.memoryUsage &&
                                    device.memoryTotal ? (
                                        <>
                                            {device.memoryUsage} /{' '}
                                            {device.memoryTotal}
                                        </>
                                    ) : device.memoryUsage ? (
                                        <>Used: {device.memoryUsage}</>
                                    ) : (
                                        <>Total: {device.memoryTotal}</>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.temperatureCpu && (
                        <div className="flex items-center gap-3">
                            <Thermometer className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    CPU Temperature
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.temperatureCpu}°C
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Storage & GPU */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Storage & Graphics
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {(device.diskUsage || device.diskTotal) && (
                        <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Disk</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.diskUsage && device.diskTotal ? (
                                        <>
                                            {device.diskUsage} /{' '}
                                            {device.diskTotal}
                                        </>
                                    ) : device.diskUsage ? (
                                        <>Used: {device.diskUsage}</>
                                    ) : (
                                        <>Total: {device.diskTotal}</>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.diskType && (
                        <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Disk Type</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.diskType.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.gpuModel && (
                        <div className="flex items-center gap-3">
                            <Monitor className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">GPU</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.gpuModel}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.gpuMemory && (
                        <div className="flex items-center gap-3">
                            <MemoryStick className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    GPU Memory
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.gpuMemory}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.temperatureGpu && (
                        <div className="flex items-center gap-3">
                            <Thermometer className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    GPU Temperature
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.temperatureGpu}°C
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Network */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Network
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {(device.publicIp || device.localIp) && (
                        <div className="flex items-center gap-3">
                            <Network className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    IP Addresses
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.publicIp &&
                                        `Public: ${device.publicIp}`}
                                    {device.publicIp && device.localIp && ' | '}
                                    {device.localIp &&
                                        `Local: ${device.localIp}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.wifiSsid && (
                        <div className="flex items-center gap-3">
                            <Wifi className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    WiFi Network
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.wifiSsid}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.wifiSignalStrength && (
                        <div className="flex items-center gap-3">
                            <Wifi className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    WiFi Signal
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.wifiSignalStrength}%
                                </p>
                            </div>
                        </div>
                    )}

                    {device.networkSpeed && (
                        <div className="flex items-center gap-3">
                            <Gauge className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Network Speed
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.networkSpeed} Mbps
                                </p>
                            </div>
                        </div>
                    )}

                    {device.ethernetConnected !== undefined && (
                        <div className="flex items-center gap-3">
                            <Network className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Ethernet</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.ethernetConnected
                                        ? 'Connected'
                                        : 'Disconnected'}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.connectionQuality && (
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Connection Quality
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {device.connectionQuality}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Peripherals */}
            {(device.hasCamera !== null ||
                device.hasMicrophone !== null ||
                device.hasBluetooth !== null ||
                device.hasWifi !== null) && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Peripherals & Features
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {device.hasCamera !== null && (
                            <div className="flex items-center gap-3">
                                <Camera className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Camera
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.hasCamera
                                            ? 'Available'
                                            : 'Not Available'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.hasMicrophone !== null && (
                            <div className="flex items-center gap-3">
                                <Mic className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Microphone
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.hasMicrophone
                                            ? 'Available'
                                            : 'Not Available'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.hasBluetooth !== null && (
                            <div className="flex items-center gap-3">
                                <Bluetooth className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Bluetooth
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.hasBluetooth
                                            ? 'Available'
                                            : 'Not Available'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.hasWifi !== null && (
                            <div className="flex items-center gap-3">
                                <Wifi className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">WiFi</p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.hasWifi
                                            ? 'Available'
                                            : 'Not Available'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Battery & Power */}
            {(device.batteryLevel !== null ||
                device.batteryStatus ||
                device.uptime) && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Battery & Power
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {device.batteryLevel !== null && (
                            <div className="flex items-center gap-3">
                                <BatteryFull className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Battery Level
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.batteryLevel}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.batteryStatus && (
                            <div className="flex items-center gap-3">
                                <BatteryFull className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Battery Status
                                    </p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {device.batteryStatus}
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.uptime && (
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Uptime
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {Math.floor(
                                            Number(device.uptime) /
                                                (1000 * 60 * 60)
                                        )}
                                        h{' '}
                                        {Math.floor(
                                            (Number(device.uptime) /
                                                (1000 * 60)) %
                                                60
                                        )}
                                        m
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Security */}
            {(device.antivirusInstalled !== null ||
                device.diskEncrypted !== null ||
                device.firewallEnabled !== null ||
                device.screenLockEnabled !== null) && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Security
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {device.antivirusInstalled !== null && (
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Antivirus
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.antivirusInstalled
                                            ? device.antivirusName ||
                                              'Installed'
                                            : 'Not Installed'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.antivirusUpToDate !== null &&
                            device.antivirusInstalled && (
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Antivirus Status
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {device.antivirusUpToDate
                                                ? 'Up to Date'
                                                : 'Outdated'}
                                        </p>
                                    </div>
                                </div>
                            )}

                        {device.firewallEnabled !== null && (
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Firewall
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.firewallEnabled
                                            ? 'Enabled'
                                            : 'Disabled'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.diskEncrypted !== null && (
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Disk Encryption
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.diskEncrypted
                                            ? 'Enabled'
                                            : 'Disabled'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {device.screenLockEnabled !== null && (
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Screen Lock
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {device.screenLockEnabled
                                            ? 'Enabled'
                                            : 'Disabled'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* User Information */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    User Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Username</p>
                            <p className="text-sm text-muted-foreground">
                                {device.user || device.username}
                            </p>
                        </div>
                    </div>

                    {device.userFullName && (
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Full Name</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.userFullName}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.userEmail && (
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.userEmail}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.isAdmin !== null && (
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Admin Rights
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.isAdmin ? 'Yes' : 'No'}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.loggedInUsers && (
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Logged In Users
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.loggedInUsers}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Agent & Additional Info */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Agent & Additional Info
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Agent Version</p>
                            <p className="text-sm text-muted-foreground">
                                v{device.agentVersion}
                            </p>
                        </div>
                    </div>

                    {device.agentStatus && (
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Agent Status
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {device.agentStatus}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.location && (
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.location}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.department && (
                        <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Department
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.department}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.processCount && (
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Running Processes
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {device.processCount}
                                </p>
                            </div>
                        </div>
                    )}

                    {device.notes && (
                        <div className="flex items-center gap-3 md:col-span-2">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Notes</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.notes}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TabsContent>
    );
};
