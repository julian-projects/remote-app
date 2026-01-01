import { useParams, Link } from "react-router-dom";
import Terminal from "../components/Terminal";

export default function AgentTerminalPage() {
    const { deviceId } = useParams();

    return (
        <div style={{ padding: 20 }}>
            <Link to="/">← Back</Link>
            <h3>🧠 Agent Terminal</h3>
            <p>Device: {deviceId}</p>
            <Terminal agentId={decodeURIComponent(deviceId!)} />
        </div>
    );
}
