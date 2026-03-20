import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import { FileText, DollarSign, Send, AlertTriangle } from "lucide-react";

// Reuse the normalization logic from your Predict.js
const normalizeClaimData = (raw) => {
  const clean = { ...raw };
  
  // Ensure numeric types for the model
  ["annual_premium", "deductible", "claim_amount", "num_prior_claims"].forEach((f) => {
    if (clean[f]) clean[f] = Number(clean[f]);
  });

  // Backend enum normalization
  if (clean.police_reported) {
    clean.police_reported = clean.police_reported === "Yes" ? "Yes" : "No";
  }

  return clean;
};

function ClaimAmount() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Expanded state to include fields required by the prediction model
  const [form, setForm] = useState({
    Policy_id: "",
    claim_amount: "",
    incident_date: new Date().toISOString().split("T")[0], // Default to today
    policy_start_date: "2023-01-01", // Usually fetched from user profile
    report_date: new Date().toISOString().split("T")[0],
    annual_premium: "1200", 
    deductible: "500",
    payment_method: "Bank",
    channel: "Online",
    police_reported: "No",
    injury_severity: "None",
    num_prior_claims: "0",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = normalizeClaimData(form);

      // 1. Run Fraud Prediction (The logic from Predict.js)
      const predictRes = await API.post("/predict", payload);
      const prediction = predictRes.data;

      // 2. Submit the actual Claim with the prediction result attached
      // This ensures the Admin sees the "Probability" in the Logs later
      await API.post("/customer/submit-claim", {
        ...payload,
        fraud_probability: prediction.fraud_probability,
        fraud_prediction: prediction.fraud_prediction,
        reasons: prediction.reason_sentences,
      });

      toast.success("Claim submitted and analyzed successfully!");
      navigate("/customer/policy-history");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#0a1628] p-6 text-white text-center">
          <h2 className="text-2xl font-bold">File a Claim</h2>
          <p className="text-blue-300 text-sm">Instant fraud analysis will be performed upon submission</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy Info */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2"><FileText size={16}/> Policy ID</label>
            <input name="Policy_id" required onChange={handleChange} value={form.Policy_id} className="w-full border p-3 rounded-lg" placeholder="POL-999" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2"><DollarSign size={16}/> Claim Amount</label>
            <input type="number" name="claim_amount" required onChange={handleChange} value={form.claim_amount} className="w-full border p-3 rounded-lg" placeholder="Amount in USD" />
          </div>

          {/* Incident Details (Required for Prediction) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Incident Date</label>
            <input type="date" name="incident_date" required onChange={handleChange} value={form.incident_date} className="w-full border p-3 rounded-lg" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2"><AlertTriangle size={16}/> Injury Severity</label>
            <select name="injury_severity" onChange={handleChange} value={form.injury_severity} className="w-full border p-3 rounded-lg">
              <option>None</option>
              <option>Minor</option>
              <option>Major</option>
              <option>Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Police Reported?</label>
            <select name="police_reported" onChange={handleChange} value={form.police_reported} className="w-full border p-3 rounded-lg">
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Prior Claims</label>
            <input type="number" name="num_prior_claims" onChange={handleChange} value={form.num_prior_claims} className="w-full border p-3 rounded-lg" />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              }`}
            >
              <Send size={18} /> {submitting ? "Analyzing & Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClaimAmount;
