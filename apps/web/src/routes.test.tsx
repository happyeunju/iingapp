import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppRoutes } from "./routes";

const getSessionMock = vi.fn();
vi.mock("./lib/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  }),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Routes (보호)", () => {
  it("/auth/login 은 인증 없이도 접근", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    renderAt("/auth/login");
    expect(screen.getByTestId("page-login")).toBeInTheDocument();
  });

  it("/ 는 비인증 시 /auth/login 으로", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    renderAt("/");
    await waitFor(() => {
      expect(screen.getByTestId("page-login")).toBeInTheDocument();
    });
  });

  it("/ 는 인증되면 Today 표시", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    renderAt("/");
    await waitFor(() => {
      expect(screen.getByTestId("page-today")).toBeInTheDocument();
    });
  });
});
