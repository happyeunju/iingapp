import { Route, Routes } from "react-router-dom";
import { Today } from "./pages/Today";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { PinSetup } from "./pages/PinSetup";
import { PinEntry } from "./pages/PinEntry";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute><Today /></ProtectedRoute>
      } />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/pin/setup" element={
        <ProtectedRoute><PinSetup /></ProtectedRoute>
      } />
      <Route path="/auth/pin" element={
        <ProtectedRoute><PinEntry /></ProtectedRoute>
      } />
    </Routes>
  );
}
