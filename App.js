import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

/* Admin Pages */
import Dashboard from "./pages/Dashboard";
import AddDealer from "./pages/AddDealer";
import DeleteDealer from "./pages/DeleteDealer";
import Logs from "./pages/Logs";
import PolicyRequests from "./pages/PolicyRequests";
import CustomerQueries from "./pages/CustomerQueries";
import AuditLogs from "./pages/AuditLogs";
import IssuePolicies from "./pages/IssuePolicy";

/* Customer Pages */
import CustDashboard from "./pages/CustDashboard";
import CustApplyPolicy from "./pages/CustApplyPolicy";
import CustIssuedPolicies from "./pages/CustIssuedPolicies";
import CustPolicyHistory from "./pages/CustPolicyHistory";
import CustAskQuestion from "./pages/CustAskQuestion";
import ClaimAmount from "./pages/ClaimAmount";
import ApplyPolicyForm from "./pages/ApplyPolicyForm";

function App() {
  return (
    <div className="font-outfit">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* 🔐 Admin Routes (All Protected) */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roleRequired="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/add" element={<ProtectedRoute roleRequired="admin"><AddDealer /></ProtectedRoute>} />
          <Route path="/admin/delete" element={<ProtectedRoute roleRequired="admin"><DeleteDealer /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute roleRequired="admin"><Logs /></ProtectedRoute>} />
          <Route path="/admin/policy-requests" element={<ProtectedRoute roleRequired="admin"><PolicyRequests /></ProtectedRoute>} />
          <Route path="/admin/customer-queries" element={<ProtectedRoute roleRequired="admin"><CustomerQueries /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute roleRequired="admin"><AuditLogs /></ProtectedRoute>} />
          <Route path="/admin/Issue-policy" element={<ProtectedRoute roleRequired="admin"><IssuePolicies /></ProtectedRoute>} />

          {/* 🔐 Customer Routes (All Protected) */}
          <Route path="/customer/dashboard" element={<ProtectedRoute roleRequired="customer"><CustDashboard /></ProtectedRoute>} />
          <Route path="/customer/apply-policy" element={<ProtectedRoute roleRequired="customer"><CustApplyPolicy /></ProtectedRoute>} />
          <Route path="/customer/issued-policies" element={<ProtectedRoute roleRequired="customer"><CustIssuedPolicies /></ProtectedRoute>} />
          <Route path="/customer/policy-history" element={<ProtectedRoute roleRequired="customer"><CustPolicyHistory /></ProtectedRoute>} />
          <Route path="/customer/ask-question" element={<ProtectedRoute roleRequired="customer"><CustAskQuestion /></ProtectedRoute>} />
          <Route path="/customer/predict" element={<ProtectedRoute roleRequired="customer"><ClaimAmount /></ProtectedRoute>} />
          <Route path="/customer/apply-form" element={<ProtectedRoute roleRequired="customer"><ApplyPolicyForm /></ProtectedRoute>} />

          {/* 404 Fallback - Redirects to Landing if route doesn't exist */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
