import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AgentsPage from './pages/AgentsPage';
import AgentTerminalPage from './pages/AgentTerminalPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AgentsPage />} />
                <Route
                    path="/agent/:deviceId"
                    element={<AgentTerminalPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}
