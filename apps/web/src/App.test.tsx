import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("앱 제목을 보여준다", () => {
    render(<App />);
    expect(screen.getByText(/iingApp/i)).toBeInTheDocument();
  });
});
