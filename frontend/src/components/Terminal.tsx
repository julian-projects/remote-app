import { useEffect, useRef, useState } from "react";

export default function Terminal({ agentId }: { agentId: string }) {
    const [status, setStatus] = useState("Connecting…");
    const [output, setOutput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3000");
        wsRef.current = ws;

        function write(text: string) {
            setOutput((o) => o + text + "\n");
        }

        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);

            if (msg.type === "output") {
                write(msg.content);
            }
        };

        ws.onopen = () => {
            setStatus("Connected");
        };

        ws.onclose = () => {
            setStatus("Disconnected");
        };

        return () => ws.close();
    }, [agentId]);

    function sendCommand(command: string) {
        wsRef.current?.send(
            JSON.stringify({
                type: "command",
                agentId,
                command,
            })
        );
    }

    function handleKey(e: React.KeyboardEvent) {
        if (e.key === "Enter" && inputRef.current) {
            const command = inputRef.current.value;
            if (command === "clear") {
                setOutput("");
                inputRef.current.value = "";
                return;
            }
            sendCommand(command);
            setOutput((o) => o + "> " + command + "\n");
            inputRef.current.value = "";
        }
    }

    return (
        <div>
            <p>Status: {status}</p>
            <pre
                style={{
                    background: "#111",
                    color: "#0f0",
                    height: 300,
                    overflow: "auto",
                }}
            >
                {output}
            </pre>
            <input
                ref={inputRef}
                onKeyDown={handleKey}
                placeholder="type: pwd, ls, whoami…"
            />
        </div>
    );
}
