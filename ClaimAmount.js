import { useState, useMemo } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { AlertCircle, ShieldCheck, DollarSign } from "lucide-react";
import confetti from "canvas-confetti";

/** Inline DateInput with Dark Styling */
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
      className={`bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 ${className}`}
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

  const selectClass = "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer";
  const inputClass = "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500";

  return (
    <div className="flex min-h-screen bg-[#0a1628]"> {/* Dark Background to match Apply Policy */}
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        
        <main className="p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            {/* Dark Mode Card */}
            <div className="bg-[#111e32] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
              
              {/* Header with Black BG Icon */}
              <div className="bg-[#1a2c46] p-6 text-white flex items-center gap-4 border-b border-slate-800">
                <div className="bg-black p-3 rounded-xl border border-gray-700">
                  <DollarSign className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Claim Amount Request</h2>
                  <p className="text-xs text-slate-400 font-medium">Process your claim with instant AI verification.</p>
                </div>
              </div>

              {/* Messages section */}
              <div className="px-8 pt-6">
                {isFraud === true && (
                  <div className="p-4 bg-orange-900/20 border border-orange-500/50 rounded-xl text-orange-200 flex items-center gap-3">
                    <div className="bg-black p-2 rounded-lg shrink-0">
                        <AlertCircle className="text-orange-500" size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Suspicious claim request detected.</p>
                        <p className="text-xs opacity-80">Sent to policy issuer for review. Please wait.</p>
                    </div>
                  </div>
                )}

                {isFraud === false && (
                  <div className="p-6 text-center animate-pulse bg-emerald-900/20 border border-emerald-500/50 rounded-xl">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-1">Congratulations! 🎉</h2>
                    <p className="text-emerald-100 text-sm">Claim verified successfully. Reloading...</p>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-red-400">
                    <div className="bg-black p-2 rounded-lg shrink-0">
                        <AlertCircle className="text-red-500" size={20} />
                    </div>
                    <div className="text-sm font-medium">{errorMsg}</div>
                  </div>
                )}
              </div>

              {/* Form - Only visible if not successfully verified */}
              {isFraud !== false && (
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="Policy_id" placeholder="Policy ID" onChange={handleChange} value={form.Policy_id} className={inputClass} />
                  <DateInput name="policy_start_date" value={form.policy_start_date} onChange={handleChange} placeholder="Policy Start Date" required />
                  <DateInput name="incident_date" value={form.incident_date} onChange={handleChange} placeholder="Incident Date" required />
                  <DateInput name="report_date" value={form.report_date} onChange={handleChange} placeholder="Report Date" required />
                  
                  <input type="number" name="annual_premium" placeholder="Annual Premium" required onChange={handleChange} value={form.annual_premium} className={inputClass} />
                  <input type="number" name="deductible" placeholder="Deductible" required onChange={handleChange} value={form.deductible} className={inputClass} />
                  <input type="number" name="claim_amount" placeholder="Claim Amount" required onChange={handleChange} value={form.claim_amount} className={inputClass} />
                  
                  <select name="payment_method" required onChange={handleChange} value={form.payment_method} className={selectClass}>
                    <option value="" className="bg-[#111e32]">Payment Method</option>
                    <option className="bg-[#111e32]">Cash</option>
                    <option className="bg-[#111e32]">Crypto</option>
                    <option className="bg-[#111e32]">Bank</option>
                  </select>

                  <select name="channel" required onChange={handleChange} value={form.channel} className={selectClass}>
                    <option value="" className="bg-[#111e32]">Channel</option>
                    <option className="bg-[#111e32]">Agent</option>
                    <option className="bg-[#111e32]">Online</option>
                  </select>

                  <select name="police_reported" required onChange={handleChange} value={form.police_reported} className={selectClass}>
                    <option value="" className="bg-[#111e32]">Police Reported</option>
                    <option className="bg-[#111e32]">Yes</option>
                    <option className="bg-[#111e32]">No</option>
                  </select>

                  <select name="injury_severity" required onChange={handleChange} value={form.injury_severity} className={selectClass}>
                    <option value="" className="bg-[#111e32]">Injury Severity</option>
                    <option className="bg-[#111e32]">None</option>
                    <option className="bg-[#111e32]">Normal</option>
                    <option className="bg-[#111e32]">Critical</option>
                    <option className="bg-[#111e32]">Major</option>
                  </select>

                  <input type="number" name="num_prior_claims" placeholder="Prior Claims" required onChange={handleChange} value={form.num_prior_claims} className={`${inputClass} md:col-span-2`} />

                  <div className="md:col-span-2 flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={submitting || !canSubmit}
                      className={`px-12 py-3 rounded-xl text-white font-bold transition-all shadow-lg ${
                        submitting || !canSubmit ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 active:scale-95"
                      }`}
                    >
                      {submitting ? "Analyzing..." : "Submit Claim"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClaimAmount;
