import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Readings from "./pages/Readings";
import DailyReports from "./pages/DailyReports";
import MonthlyReports from "./pages/MonthlyReports";
import AppLayout from "./components/layout/AppLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#EAF4FE] flex flex-col items-center justify-center p-4">
        <img
          src="/images/sweety-logo-cropped.png"
          alt="Sweety Logo"
          className="h-16 w-auto object-contain mb-4 animate-pulse"
        />
        <LoadingSpinner message="Initializing Sweety health platform..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      {/* Authenticated Application with Horizontal Top Navbar Layout */}
      <Route
        element={
          isAuthenticated ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/readings" element={<Readings />} />
        <Route path="/daily-reports" element={<DailyReports />} />
        <Route path="/monthly-reports" element={<MonthlyReports />} />
        {/* Redirect for removed Profile and Settings pages */}
        <Route
          path="/profile"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/settings"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Backward Compatibility for previous /reports route */}
        <Route
          path="/reports"
          element={<Navigate to="/daily-reports" replace />}
        />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
