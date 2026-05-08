import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PinEntry } from "./PinEntry";

const apiFetchMock = vi.fn();
vi.mock("../lib/api", () => ({
  apiFetch: (...a: unknown[]) => apiFetchMock(...a),
}));

describe("PinEntry", () => {
  it("정답 PIN → Today 이동", async () => {
    apiFetchMock.mockResolvedValue({ ok: true });
    render(
      <MemoryRouter initialEntries={["/auth/pin"]}>
        <Routes>
          <Route path="/auth/pin" element={<PinEntry />} />
          <Route path="/" element={<div>today</div>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /확인/i }));
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/auth/pin",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(screen.getByText("today")).toBeInTheDocument();
    });
  });

  it("틀린 PIN → 에러 메시지", async () => {
    apiFetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "wrong_pin", attempts: 1 }),
    });
    render(
      <MemoryRouter>
        <PinEntry />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: "0000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /확인/i }));
    expect(
      await screen.findByText(/PIN이 일치하지 않습니다/)
    ).toBeInTheDocument();
  });
});
