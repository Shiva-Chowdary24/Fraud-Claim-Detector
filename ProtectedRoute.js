import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // Ensure you save "admin" or "customer" during login

  // 1. If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If role doesn't match, redirect to unauthorized or home
  if (roleRequired && userRole !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
