import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const getSessionMock = vi.fn();
vi.mock("../lib/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }),
}));

describe("ProtectedRoute", () => {
  it("세션 없으면 /auth/login 으로 리다이렉트", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    render(
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/secret" element={
            <ProtectedRoute><div>SECRET</div></ProtectedRoute>
          } />
          <Route path="/auth/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText("LOGIN")).toBeInTheDocument());
  });

  it("세션 있으면 자식 렌더", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    render(
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/secret" element={
            <ProtectedRoute><div>SECRET</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText("SECRET")).toBeInTheDocument());
  });
});
