import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from "react-router-dom";
import { Today } from "./pages/Today";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { PinSetup } from "./pages/PinSetup";
import { PinEntry } from "./pages/PinEntry";
export function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Today, {}) }), _jsx(Route, { path: "/auth/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/auth/callback", element: _jsx(AuthCallback, {}) }), _jsx(Route, { path: "/auth/pin/setup", element: _jsx(PinSetup, {}) }), _jsx(Route, { path: "/auth/pin", element: _jsx(PinEntry, {}) })] }));
}
