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
import PolicyRequests from "./pages/PolicyRequests"
import CustomerQueries from "./pages/CustomerQueries"
import AuditLogs from "./pages/AuditLogs"
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
          

          {/* Admin Routes */}

          <Route path="/admin/dashboard" element={<ProtectedRoute roleRequired="admin"><Dashboard /></ProtectedRoute>}/>
          <Route path="/admin/add" element={<AddDealer />} />
          <Route path="/admin/delete" element={<DeleteDealer />} />
          <Route path="/admin/logs" element={<Logs />} />
          <Route path="/admin/policy-requests" element={<PolicyRequests/>}/>
          <Route path="/admin/customer-queries" element={<CustomerQueries/>}/>
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/Issue-policy" element={<IssuePolicies />} />
          {/* Customer Routes */}

          <Route path="/customer/dashboard" element={<ProtectedRoute roleRequired="customer"><CustDashboard /></ProtectedRoute>}/>
          <Route path="/customer/apply-policy" element={<CustApplyPolicy />} />
          <Route path="/customer/issued-policies" element={<CustIssuedPolicies />} />
          <Route path="/customer/policy-history" element={<CustPolicyHistory />} />
          <Route path="/customer/ask-question" element={<CustAskQuestion />} />
          <Route path="/customer/predict" element={<ClaimAmount />} />
          <Route path="/customer/apply-form" element={<ApplyPolicyForm />} />

        </Routes>

      </BrowserRouter>

      {/* Toast Notifications */}

      <ToastContainer position="top-right" autoClose={3000} />

    </div>

  );
}

export default App;
