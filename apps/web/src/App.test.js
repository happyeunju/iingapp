import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";
describe("App", () => {
    it("기본 진입 시 Today 페이지가 보인다", () => {
        render(_jsx(App, {}));
        expect(screen.getByTestId("page-today")).toBeInTheDocument();
    });
});
