import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppRoutes } from "./routes";
function renderAt(path) {
    return render(_jsx(MemoryRouter, { initialEntries: [path], children: _jsx(Routes, { children: _jsx(Route, { path: "/*", element: _jsx(AppRoutes, {}) }) }) }));
}
describe("Routes", () => {
    it("/ 는 Today 페이지", () => {
        renderAt("/");
        expect(screen.getByTestId("page-today")).toBeInTheDocument();
    });
    it("/auth/login 은 Login 페이지", () => {
        renderAt("/auth/login");
        expect(screen.getByTestId("page-login")).toBeInTheDocument();
    });
    it("/auth/callback 은 Callback 페이지", () => {
        renderAt("/auth/callback");
        expect(screen.getByTestId("page-auth-callback")).toBeInTheDocument();
    });
    it("/auth/pin/setup", () => {
        renderAt("/auth/pin/setup");
        expect(screen.getByTestId("page-pin-setup")).toBeInTheDocument();
    });
    it("/auth/pin", () => {
        renderAt("/auth/pin");
        expect(screen.getByTestId("page-pin-entry")).toBeInTheDocument();
    });
});
