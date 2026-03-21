import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // 'admin' or 'customer'
  const location = useLocation();

  // 1. If no token, they aren't logged in at all
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If they have a token but are trying to access a page above their "Pay Grade"
  // Example: Customer tries to type /admin/dashboard
  if (roleRequired && userRole !== roleRequired) {
    // Redirect them to their own dashboard instead of the login page
    const fallbackPath = userRole === "admin" ? "/admin/dashboard" : "/customer/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  // 3. If everything matches, let them in
  return children;
};

export default ProtectedRoute;
