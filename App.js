import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
// ... (Your imports for all pages)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Admin Routes - Only accessible if role === 'admin' */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roleRequired="admin"><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/add" element={<ProtectedRoute roleRequired="admin"><AddDealer /></ProtectedRoute>} />
        <Route path="/admin/delete" element={<ProtectedRoute roleRequired="admin"><DeleteDealer /></ProtectedRoute>} />
        <Route path="/admin/policy-requests" element={<ProtectedRoute roleRequired="admin"><PolicyRequests /></ProtectedRoute>} />
        <Route path="/admin/customer-queries" element={<ProtectedRoute roleRequired="admin"><CustomerQueries /></ProtectedRoute>} />
        <Route path="/admin/Issue-policy" element={<ProtectedRoute roleRequired="admin"><IssuePolicies /></ProtectedRoute>} />

        {/* 🔐 Customer Routes - Only accessible if role === 'customer' */}
        <Route path="/customer/dashboard" element={<ProtectedRoute roleRequired="customer"><CustDashboard /></ProtectedRoute>} />
        <Route path="/customer/apply-policy" element={<ProtectedRoute roleRequired="customer"><CustApplyPolicy /></ProtectedRoute>} />
        <Route path="/customer/policy-history" element={<ProtectedRoute roleRequired="customer"><CustPolicyHistory /></ProtectedRoute>} />
        <Route path="/customer/apply-form" element={<ProtectedRoute roleRequired="customer"><ApplyPolicyForm /></ProtectedRoute>} />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
