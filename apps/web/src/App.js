import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
export function App() {
    return (_jsx(BrowserRouter, { children: _jsx("main", { className: "min-h-screen p-6", children: _jsx(AppRoutes, {}) }) }));
}
