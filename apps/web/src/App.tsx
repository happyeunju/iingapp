import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen p-6">
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}
