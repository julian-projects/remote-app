// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';
import './index.css';
import { Toaster } from './components/ui/sonner';
import { DevicesProvider } from './pages/Home/DevicesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <DevicesProvider>
                    <RouterProvider router={router} />
                    <Toaster />
                </DevicesProvider>
            </ThemeProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
