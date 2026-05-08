import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PinSetup } from "./PinSetup";

const apiFetchMock = vi.fn();
vi.mock("../lib/api", () => ({
  apiFetch: (...a: unknown[]) => apiFetchMock(...a),
}));

describe("PinSetup", () => {
  it("4자리 입력 후 제출 → API 호출 + Today 이동", async () => {
    apiFetchMock.mockResolvedValue({ ok: true });
    render(
      <MemoryRouter initialEntries={["/auth/pin/setup"]}>
        <Routes>
          <Route path="/auth/pin/setup" element={<PinSetup />} />
          <Route path="/" element={<div>today</div>} />
        </Routes>
      </MemoryRouter>
    );
    const input = screen.getByLabelText(/PIN/i);
    fireEvent.change(input, { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /저장/i }));
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/me/pin",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(screen.getByText("today")).toBeInTheDocument();
    });
  });
});
