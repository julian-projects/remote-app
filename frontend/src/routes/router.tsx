// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Device } from "@/pages/Device";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/device/:id",
        element: <Device />,
    },
]);
