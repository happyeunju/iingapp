import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthCallback } from "./AuthCallback";

const getSessionMock = vi.fn();

vi.mock("../lib/supabase", () => ({
  getSupabase: () => ({
    auth: { getSession: getSessionMock },
  }),
}));

describe("AuthCallback", () => {
  it("세션이 있으면 PIN 등록/입력으로 이동", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1", email: "x@y.z" } } },
    });

    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/pin/setup" element={<div>setup</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/setup/)).toBeInTheDocument();
    });
  });

  it("세션 없으면 /auth/login 으로 이동", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("login-page")).toBeInTheDocument();
    });
  });
});
