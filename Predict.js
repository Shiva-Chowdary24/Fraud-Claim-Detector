import { useState, useMemo } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { AlertCircle, ShieldCheck, DollarSign } from "lucide-react";
import confetti from "canvas-confetti";

/** Inline DateInput component remains the same */
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
      className={`border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
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

function ClaimAmount() {
  const [form, setForm] = useState({
    Policy_id: "", policy_start_date: "", incident_date: "", report_date: "",
    annual_premium: "", deductible: "", claim_amount: "",
    payment_method: "", channel: "", police_reported: "", injury_severity: "",
    num_prior_claims: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isFraud, setIsFraud] = useState(null);

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
    if (isFraud !== null) setIsFraud(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = normalizeForm(form);
      const res = await API.post("/predict", payload);
      
      if (res.data.fraud_prediction === 0) {
        setIsFraud(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => { window.location.reload(); }, 3000);
      } else {
        setIsFraud(true);
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CustSidebar />
      <div className="flex-1 flex flex-col">
        <CustNavbar />
        <main className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Header with Black BG Icon */}
            <div className="bg-[#0a1628] p-6 text-white flex items-center gap-4">
              <div className="bg-black p-3 rounded-xl border border-gray-700">
                <DollarSign className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Claim Amount Request</h2>
                <p className="text-xs text-gray-400">Process your claim with instant AI verification.</p>
              </div>
            </div>

            {/* Suspicious Message with Black BG Icon */}
            {isFraud === true && (
              <div className="m-6 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-700 flex items-center gap-3">
                 <div className="bg-black p-2 rounded-lg shrink-0">
                    <AlertCircle className="text-orange-500" size={20} />
                 </div>
                 <div>
                    <p className="font-bold text-sm">Suspicious claim request detected.</p>
                    <p className="text-xs">Sent to policy issuer for review. Please wait.</p>
                 </div>
              </div>
            )}

            {/* Success Message */}
            {isFraud === false && (
              <div className="m-6 p-6 text-center animate-bounce">
                <h2 className="text-3xl font-bold text-green-600 mb-2">Congratulations! 🎉</h2>
                <p className="text-gray-600 font-medium">Claim verified successfully.</p>
              </div>
            )}

            {/* Error Message with Black BG Icon */}
            {errorMsg && (
              <div className="m-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-red-600">
                <div className="bg-black p-2 rounded-lg shrink-0">
                    <AlertCircle className="text-red-500" size={20} />
                </div>
                <div className="text-sm font-medium">{errorMsg}</div>
              </div>
            )}

            {isFraud !== false && (
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form fields remain the same as before */}
                <input type="text" name="Policy_id" placeholder="Policy ID" onChange={handleChange} value={form.Policy_id} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <DateInput name="policy_start_date" value={form.policy_start_date} onChange={handleChange} placeholder="Policy Start Date" required />
                <DateInput name="incident_date" value={form.incident_date} onChange={handleChange} placeholder="Incident Date" required />
                <DateInput name="report_date" value={form.report_date} onChange={handleChange} placeholder="Report Date" required />
                <input type="number" name="annual_premium" placeholder="Annual Premium" required onChange={handleChange} value={form.annual_premium} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <input type="number" name="deductible" placeholder="Deductible" required onChange={handleChange} value={form.deductible} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <input type="number" name="claim_amount" placeholder="Claim Amount" required onChange={handleChange} value={form.claim_amount} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                
                <select name="payment_method" required onChange={handleChange} value={form.payment_method} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Payment Method</option>
                  <option>Cash</option><option>Crypto</option><option>Bank</option>
                </select>

                <select name="channel" required onChange={handleChange} value={form.channel} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Channel</option>
                  <option>Agent</option><option>Online</option>
                </select>

                <select name="police_reported" required onChange={handleChange} value={form.police_reported} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Police Reported</option>
                  <option>Yes</option><option>No</option>
                </select>

                <select name="injury_severity" required onChange={handleChange} value={form.injury_severity} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Injury Severity</option>
                  <option>None</option><option>Normal</option><option>Critical</option><option>Major</option>
                </select>

                <input type="number" name="num_prior_claims" placeholder="Prior Claims" required onChange={handleChange} value={form.num_prior_claims} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2" />

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !canSubmit}
                    className={`px-10 py-3 rounded-xl text-white font-bold transition-all shadow-lg ${
                      submitting || !canSubmit ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Claim"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClaimAmount;
