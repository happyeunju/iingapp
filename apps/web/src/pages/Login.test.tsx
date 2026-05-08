import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "./Login";

const signInWithOtpMock = vi.fn();

vi.mock("../lib/supabase", () => ({
  getSupabase: () => ({
    auth: { signInWithOtp: signInWithOtpMock },
  }),
}));

beforeEach(() => signInWithOtpMock.mockReset());

describe("Login", () => {
  it("이메일 입력 후 매직링크 발송 호출", async () => {
    signInWithOtpMock.mockResolvedValue({ error: null });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/이메일/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /로그인/i }));

    await waitFor(() => {
      expect(signInWithOtpMock).toHaveBeenCalledWith({
        email: "me@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
    expect(await screen.findByText(/메일/i)).toBeInTheDocument();
  });

  it("에러 발생 시 메시지 표시", async () => {
    signInWithOtpMock.mockResolvedValue({ error: { message: "rate limit" } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/이메일/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /로그인/i }));

    expect(await screen.findByText(/rate limit/i)).toBeInTheDocument();
  });
});
