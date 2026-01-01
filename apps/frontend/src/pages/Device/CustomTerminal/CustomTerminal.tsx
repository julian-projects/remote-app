import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TerminalIcon, Copy, RotateCcw, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGetDevice } from '@/lib/hooks';
import { useParams } from 'react-router-dom';

interface TerminalLine {
    type: 'output' | 'input' | 'prompt' | 'error' | 'info' | 'warning';
    content: string;
    timestamp?: Date;
}

export const CustomTerminal = () => {
    const [wsConnected, setWsConnected] = useState(false);
    const [deviceVerified, setDeviceVerified] = useState(false);
    const [_, setDeviceUserID] = useState<string | null>(null);
    const [lines, setLines] = useState<TerminalLine[]>([
        {
            type: 'info',
            content: '=== Custom Remote Terminal ===',
        },
    ]);
    const [input, setInput] = useState('');
    const [currentDir, setCurrentDir] = useState('~');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const wsRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const connectedRef = useRef(false);
    const { id } = useParams<{ id: string }>();
    const { data: selectedDevice } = useGetDevice(id || '');

    // Initialize WebSocket with verification
    useEffect(() => {
        if (!selectedDevice?.id) return;

        // Verify device ID first
        const verifyDevice = async () => {
            try {
                setLines((prev) => [
                    ...prev,
                    {
                        type: 'info',
                        content: 'Verifying device...',
                    },
                ]);

                const verifyResponse = await fetch(
                    'http://localhost:8585/verify_id',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: selectedDevice.id,
                        }),
                    }
                );

                if (!verifyResponse.ok) {
                    const error = await verifyResponse.json();
                    setLines((prev) => [
                        ...prev,
                        {
                            type: 'error',
                            content: `✗ Device verification failed: ${error.error}`,
                        },
                    ]);
                    return;
                }

                const verifyData = await verifyResponse.json();
                console.log('Device verified:', verifyData);
                setDeviceUserID(verifyData.user_id);

                // Remove verification message
                setLines((prev) =>
                    prev.filter(
                        (line) => line.content !== 'Verifying device...'
                    )
                );

                // Device verified, establish WebSocket
                const ws = new WebSocket('ws://localhost:8585/ws');

                const handleOpen = () => {
                    console.log('WebSocket connected');
                    connectedRef.current = true;
                    setWsConnected(true);
                    setDeviceVerified(true);
                    setLines((prev) => [
                        ...prev,
                        {
                            type: 'info',
                            content: `✓ Device verified and connected`,
                        },
                    ]);
                };

                const handleError = (error: Event) => {
                    console.error('WebSocket error:', error);
                    connectedRef.current = false;
                    setWsConnected(false);
                    setLines((prev) => [
                        ...prev,
                        {
                            type: 'error',
                            content: 'WebSocket connection error',
                        },
                    ]);
                };

                const handleClose = () => {
                    console.log('WebSocket disconnected');
                    connectedRef.current = false;
                    setWsConnected(false);
                };

                const handleMessage = (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data);
                        console.log('WebSocket response:', response);

                        // Handle initial prompt from server
                        if (response.prompt && !response.status) {
                            setLines((prev) => [
                                ...prev,
                                {
                                    type: 'prompt',
                                    content: response.prompt,
                                },
                            ]);
                            return;
                        }

                        // Handle command responses
                        if (response.output) {
                            setLines((prev) => [
                                ...prev,
                                {
                                    type: 'output',
                                    content: response.output,
                                },
                            ]);
                        }

                        if (response.error) {
                            setLines((prev) => [
                                ...prev,
                                {
                                    type: 'error',
                                    content: `Error: ${response.error}`,
                                },
                            ]);
                        }

                        // Add prompt from response
                        if (response.prompt) {
                            setLines((prev) => [
                                ...prev,
                                {
                                    type: 'prompt',
                                    content: response.prompt,
                                },
                            ]);

                            // Update directory if provided
                            if (response.dir) {
                                setCurrentDir(response.dir);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to parse response:', err);
                    }
                };

                ws.addEventListener('open', handleOpen);
                ws.addEventListener('error', handleError);
                ws.addEventListener('close', handleClose);
                ws.addEventListener('message', handleMessage);

                wsRef.current = ws;

                return () => {
                    ws.removeEventListener('open', handleOpen);
                    ws.removeEventListener('error', handleError);
                    ws.removeEventListener('close', handleClose);
                    ws.removeEventListener('message', handleMessage);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                };
            } catch (err) {
                console.error('Verification error:', err);
                setLines((prev) => [
                    ...prev,
                    {
                        type: 'error',
                        content: `Verification error: ${
                            err instanceof Error ? err.message : 'Unknown error'
                        }`,
                    },
                ]);
            }
        };

        verifyDevice();
    }, [selectedDevice]);

    const executeCommand = (cmd: string) => {
        cmd = cmd.trim();

        // Check device verification first
        if (!deviceVerified) {
            setLines((prev) => [
                ...prev,
                {
                    type: 'error',
                    content:
                        'Error: Device not verified. Cannot execute commands.',
                },
            ]);
            return;
        }

        if (!cmd) {
            setLines((prev) => [
                ...prev,
                {
                    type: 'prompt',
                    content: `${selectedDevice?.user}@${selectedDevice?.hostname}:${currentDir}$`,
                },
            ]);
            return;
        }

        // Add to history
        setHistory((prev) => [...prev, cmd]);
        setHistoryIndex(-1);

        // Show input
        setLines((prev) => [
            ...prev,
            {
                type: 'input',
                content: cmd,
            },
        ]);

        // Handle clear command locally
        if (cmd === 'clear') {
            setLines([]);
            setLines((prev) => [
                ...prev,
                {
                    type: 'prompt',
                    content: `${selectedDevice?.user}@${selectedDevice?.hostname}:${currentDir}$`,
                },
            ]);
            return;
        }

        // Send to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({
                    event: 'command',
                    data: { command: cmd },
                })
            );
        } else {
            setLines((prev) => [
                ...prev,
                {
                    type: 'error',
                    content: 'Error: Not connected to remote agent',
                },
            ]);
            setLines((prev) => [
                ...prev,
                {
                    type: 'prompt',
                    content: `${selectedDevice?.user}@${selectedDevice?.hostname}:${currentDir}$`,
                },
            ]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex =
                    historyIndex === -1
                        ? history.length - 1
                        : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > -1) {
                const newIndex = historyIndex + 1;
                if (newIndex < history.length) {
                    setHistoryIndex(newIndex);
                    setInput(history[newIndex]);
                } else {
                    setHistoryIndex(-1);
                    setInput('');
                }
            }
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const copyTerminal = () => {
        const text = lines
            .map((line) => {
                if (line.type === 'prompt') return line.content;
                if (line.type === 'input') return line.content;
                return line.content;
            })
            .join('\n');
        navigator.clipboard.writeText(text);
    };

    const clearTerminal = () => {
        setLines([
            {
                type: 'prompt',
                content: `${selectedDevice?.user}@${selectedDevice?.hostname}:~$`,
            },
        ]);
        setCurrentDir('~');
    };

    return (
        <Card className="flex-1 sticky top-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <TerminalIcon className="h-5 w-5" />
                        Remote Terminal
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    wsConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            />
                            <span
                                className={
                                    wsConnected
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }
                            >
                                {wsConnected ? 'Connected' : 'Disconnected'}
                            </span>
                            {wsConnected && (
                                <>
                                    <span className="text-muted-foreground">
                                        •
                                    </span>
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            deviceVerified
                                                ? 'bg-green-500'
                                                : 'bg-yellow-500'
                                        }`}
                                    />
                                    <span
                                        className={
                                            deviceVerified
                                                ? 'text-green-500'
                                                : 'text-yellow-500'
                                        }
                                    >
                                        {deviceVerified
                                            ? 'Verified'
                                            : 'Verifying...'}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyTerminal}
                                title="Copy terminal output"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearTerminal}
                                title="Clear terminal"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {/* Terminal Output Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 rounded-md border border-border bg-[#0f0f0f] p-4 font-mono text-sm text-[#d4d4d4] overflow-y-auto max-h-[500px]"
                    onClick={() => inputRef.current?.focus()}
                >
                    <div className="space-y-1">
                        {lines.map((line, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-2 ${
                                    line.type === 'error'
                                        ? 'text-red-400'
                                        : line.type === 'warning'
                                        ? 'text-yellow-400'
                                        : line.type === 'info'
                                        ? 'text-blue-400'
                                        : line.type === 'prompt'
                                        ? 'text-green-400'
                                        : line.type === 'input'
                                        ? 'text-white'
                                        : 'text-[#d4d4d4]'
                                }`}
                            >
                                {line.type === 'input' && (
                                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                                )}
                                <span className="wrap-break-word whitespace-pre-wrap">
                                    {line.content}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex items-center gap-2 rounded-md border border-border bg-[#1a1a1a] pl-3">
                    <span className="text-xs text-green-400 font-mono">
                        {selectedDevice?.user}@{selectedDevice?.hostname}:
                        {currentDir}
                    </span>
                    <Input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter command..."
                        className="flex-1 border-0 bg-transparent text-sm focus-visible:ring-0 placeholder-muted-foreground"
                        disabled={!wsConnected}
                    />
                </div>

                <p className="text-xs text-muted-foreground">
                    ws://localhost:8585/ws
                </p>
            </CardContent>
        </Card>
    );
};
