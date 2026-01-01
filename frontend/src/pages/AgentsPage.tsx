import { Button } from '@/components/ui/button';

export default function AgentsPage() {
    return (
        <div style={{ padding: 20 }}>
            <h2>🧠 Connected Agents</h2>
            <table border={1} cellPadding={8}>
                <thead>
                    <tr>
                        <th>Device ID</th>
                        <th>Open</th>
                    </tr>
                </thead>
                <tbody>
                    <Button>Hello</Button>
                </tbody>
            </table>
        </div>
    );
}
