import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { App } from "./App";

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

describe("App", () => {
  it("기본 진입 시 Today 페이지가 보인다", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("page-today")).toBeInTheDocument();
    });
  });
});
