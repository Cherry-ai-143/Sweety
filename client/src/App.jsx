import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading Sweety...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={<div>Register Page Coming Soon</div>}
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated
            ? <div>Dashboard Coming Soon</div>
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;