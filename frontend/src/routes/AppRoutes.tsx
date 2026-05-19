import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import SignIn from "../pages/SignIn.tsx";
import SignUp from "../pages/SignUp.tsx";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function AppShell() {
  const location = useLocation();
  const hideNavbar =
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/" ||
    location.pathname === "/sign-in" ||
    location.pathname === "/sign-up";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/folders/:folderId"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/recents"
          element={
            <ProtectedRoute>
              <Dashboard view="recents" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/starred"
          element={
            <ProtectedRoute>
              <Dashboard view="starred" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/trash"
          element={
            <ProtectedRoute>
              <Dashboard view="trash" />
            </ProtectedRoute>
          }
        />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;