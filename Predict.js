import { useState, useMemo } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { AlertCircle } from "lucide-react";

/** Inline DateInput: same as before */
const DateInput = ({ name, value, onChange, placeholder = "mm/dd/yyyy", required = false, className = "", ...rest }) => {
  const handleFocus = (e) => { e.target.type = "date"; };
  const handleBlur = (e) => { if (!e.target.value) e.target.type = "text"; };
  return (
    <input
      type={value ? "date" : "text"}
      name={name}
      value={value || ""}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      className={`border p-3 rounded ${className}`}
      {...rest}
    />
  );
};

const normalizeForm = (raw) => {
  const clean = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v === "" ? null : v])
  );
  if (!clean.Policy_id && clean.Policy) { clean.Policy_id = clean.Policy; delete clean.Policy; }
  if (typeof clean.police_reported === "string") { clean.police_reported = clean.police_reported === "Yes" ? "Yes" : "No"; }
  ["annual_premium", "deductible", "claim_amount", "num_prior_claims"].forEach((f) => {
    if (clean[f] !== null && clean[f] !== undefined && clean[f] !== "") { clean[f] = Number(clean[f]); }
  });
  return clean;
};

function Predict() {
  const [form, setForm] = useState({
    Policy_id: "", policy_start_date: "", incident_date: "", report_date: "",
    annual_premium: "", deductible: "", claim_amount: "",
    payment_method: "", channel: "", police_reported: "", injury_severity: "",
    num_prior_claims: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = useMemo(() => {
    return (
      form.policy_start_date && form.incident_date && form.report_date &&
      form.annual_premium !== "" && form.deductible !== "" && form.claim_amount !== "" &&
      form.payment_method && form.channel && form.police_reported &&
      form.injury_severity && form.num_prior_claims !== ""
    );
  }, [form]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = normalizeForm(form);
      await API.post("/predict", payload);
      // Logic for redirection or success state goes here
    } catch (error) {
      setErrorMsg(error?.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Fraud Prediction</h2>

      {errorMsg && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="Policy_id" placeholder="Policy ID" onChange={handleChange} value={form.Policy_id} className="border p-3 rounded" />
          <DateInput name="policy_start_date" value={form.policy_start_date} onChange={handleChange} placeholder="Policy Start Date" required />
          <DateInput name="incident_date" value={form.incident_date} onChange={handleChange} placeholder="Incident Date" required />
          <DateInput name="report_date" value={form.report_date} onChange={handleChange} placeholder="Report Date" required />
          <input type="number" name="annual_premium" placeholder="Annual Premium" required onChange={handleChange} value={form.annual_premium} className="border p-3 rounded" />
          <input type="number" name="deductible" placeholder="Deductible" required onChange={handleChange} value={form.deductible} className="border p-3 rounded" />
          <input type="number" name="claim_amount" placeholder="Claim Amount" required onChange={handleChange} value={form.claim_amount} className="border p-3 rounded" />
          
          <select name="payment_method" required onChange={handleChange} value={form.payment_method} className="border p-3 rounded">
            <option value="">Payment Method</option>
            <option>Cash</option><option>Crypto</option><option>Bank</option>
          </select>

          <select name="channel" required onChange={handleChange} value={form.channel} className="border p-3 rounded">
            <option value="">Channel</option>
            <option>Agent</option><option>Online</option>
          </select>

          <select name="police_reported" required onChange={handleChange} value={form.police_reported} className="border p-3 rounded">
            <option value="">Police Reported</option>
            <option>Yes</option><option>No</option>
          </select>

          <select name="injury_severity" required onChange={handleChange} value={form.injury_severity} className="border p-3 rounded">
            <option value="">Injury Severity</option>
            <option>None</option><option>Normal</option><option>Critical</option><option>Major</option>
          </select>

          <input type="number" name="num_prior_claims" placeholder="Prior Claims" required onChange={handleChange} value={form.num_prior_claims} className="border p-3 rounded md:col-span-2" />
        </div>

        {/* Updated Button */}
        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className={`mt-8 px-6 py-3 rounded text-white font-bold transition-all ${
            submitting || !canSubmit ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </AdminLayout>
  );
}

export default Predict;
