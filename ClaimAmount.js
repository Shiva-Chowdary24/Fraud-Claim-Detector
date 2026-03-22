import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { AlertCircle, DollarSign, X, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

/** * Reusable Date Input to match your dark theme 
 */
const DateInput = ({ name, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] text-slate-500 uppercase px-1 tracking-widest text-left">{placeholder}</label>
    <input
      type={value ? "date" : "text"}
      name={name}
      value={value || ""}
      onChange={onChange}
      onFocus={(e) => (e.target.type = "date")}
      onBlur={(e) => !e.target.value && (e.target.type = "text")}
      placeholder={placeholder}
      className="bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      required
    />
  </div>
);

function ClaimAmount() {
  const navigate = useNavigate();
  
  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [isSuspicious, setIsSuspicious] = useState(false);
  
  // Form State (12+ Fields)
  const [form, setForm] = useState({
    Policy_id: "",
    policy_start_date: "",
    incident_date: "",
    report_date: "",
    annual_premium: "",
    deductible: "",
    claim_amount: "",
    payment_method: "",
    channel: "",
    police_reported: "",
    injury_severity: "",
    num_prior_claims: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (isSuspicious) setIsSuspicious(false);
  };

  /**
   * Main Submission Logic with Automatic Customer ID Injection
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // ✅ STEP 1: Get the 6-digit ID automatically from the user's login session
    const autoID = localStorage.getItem("customer_id");

    // ✅ STEP 2: Create the payload with the auto-injected ID
    const payload = {
      ...form, 
      customer_id: autoID // Automatic injection for backend Fraud_Logs
    };

    try {
      // 1. Send data to Fraud Prediction Model
      const res = await API.post("/predict", payload);
      
      console.log("Prediction Success:", res.data);

      // ✅ THE CONNECTION LOGIC
      // If Fraud Prediction is 0 (Safe)
      if (res.data.fraud_prediction === 0) {
        toast.success("AI Analysis: Claim Verified");
        navigate("/customer/predict-claim", { 
          state: { autoApproved: true } 
        });
      } 
      // If Fraud Prediction is 1 (Suspicious)
      else {
        setIsSuspicious(true);
        toast.warning("Risk Flagged: Awaiting Admin Review");
      }
    } catch (err) {
      console.error("Verification Engine Failure", err);
      toast.error("Error linking Customer ID to Fraud Log");
    } finally {
      setSubmitting(false);
    }
  };

  // Styling Constants
  const selectClass = "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer mt-5";
  const inputClass = "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500";

  return (
    <div className="flex min-h-screen bg-[#0a1628] font-mono text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        
        <main className="p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto border border-white p-1">
            
            {isSuspicious ? (
              /* --- SUSPICIOUS ALERT VIEW --- */
              <div className="bg-black border border-white p-16 relative animate-in zoom-in duration-300">
                <button 
                  onClick={() => setIsSuspicious(false)} 
                  className="absolute top-4 right-4 border border-white p-2 hover:bg-white hover:text-black transition-all"
                >
                  <X size={24} />
                </button>

                <div className="text-center space-y-8">
                  <ShieldAlert size={80} className="mx-auto text-red-500" />
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black uppercase text-red-500 tracking-tighter">Security Alert</h2>
                    <div className="p-6 border border-red-500 bg-red-500/5">
                      <p className="text-lg uppercase font-bold text-white italic">It seems that your claim is suspicious.</p>
                      <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-[0.3em] font-bold text-center">
                        Please wait until admin reviews the claim.
                      </p>
                    </div>
                  </div>
                  <p className="text-[8px] text-gray-800 uppercase pt-4 tracking-[0.5em]">Auth_Failure_Code: FLAG_01</p>
                </div>
              </div>
            ) : (
              /* --- DATA ENTRY FORM VIEW --- */
              <div className="bg-[#111e32] border border-white shadow-2xl">
                <div className="bg-[#1a2c46] p-6 text-white flex items-center gap-4 border-b border-white">
                  <div className="bg-black p-3 border border-gray-700 text-left">
                    <DollarSign className="text-blue-400" size={24} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold uppercase tracking-widest">Policy Claim Request</h2>
                    <p className="text-[10px] text-slate-400 uppercase">Input all relevant metrics for AI verification.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 uppercase px-1 tracking-widest">Policy ID</label>
                    <input type="text" name="Policy_id" placeholder="Enter ID" onChange={handleChange} value={form.Policy_id} className={inputClass} required />
                  </div>

                  <DateInput name="policy_start_date" value={form.policy_start_date} onChange={handleChange} placeholder="Policy Start Date" />
                  <DateInput name="incident_date" value={form.incident_date} onChange={handleChange} placeholder="Incident Occurrence" />
                  <DateInput name="report_date" value={form.report_date} onChange={handleChange} placeholder="Official Report Date" />
                  
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-500 uppercase px-1 tracking-widest">Annual Premium</label>
                    <input type="number" name="annual_premium" placeholder="0.00" required onChange={handleChange} value={form.annual_premium} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-500 uppercase px-1 tracking-widest">Deductible</label>
                    <input type="number" name="deductible" placeholder="0.00" required onChange={handleChange} value={form.deductible} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-500 uppercase px-1 tracking-widest">Requested Claim Amount</label>
                    <input type="number" name="claim_amount" placeholder="0.00" required onChange={handleChange} value={form.claim_amount} className={inputClass} />
                  </div>
                  
                  <select name="payment_method" required onChange={handleChange} value={form.payment_method} className={selectClass}>
                    <option value="">Payment Method</option>
                    <option>Cash</option><option>Crypto</option><option>Bank Transfer</option>
                  </select>

                  <select name="channel" required onChange={handleChange} value={form.channel} className={selectClass}>
                    <option value="">Submission Channel</option>
                    <option>Agent</option><option>Online Portal</option>
                  </select>

                  <select name="police_reported" required onChange={handleChange} value={form.police_reported} className={selectClass}>
                    <option value="">Police Reported?</option>
                    <option>Yes</option><option>No</option>
                  </select>

                  <select name="injury_severity" required onChange={handleChange} value={form.injury_severity} className={selectClass}>
                    <option value="">Injury Severity</option>
                    <option>None</option><option>Normal</option><option>Critical</option><option>Major</option>
                  </select>

                  <div className="flex flex-col gap-1 md:col-span-2 text-left">
                    <label className="text-[10px] text-slate-500 uppercase px-1 tracking-widest">Number of Prior Claims</label>
                    <input type="number" name="num_prior_claims" placeholder="0" required onChange={handleChange} value={form.num_prior_claims} className={inputClass} />
                  </div>

                  <div className="md:col-span-2 pt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full border border-white py-5 text-lg font-black uppercase hover:bg-white hover:text-black transition-all flex justify-center items-center gap-4 group"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={20} /> ANALYZING_DATA...
                        </div>
                      ) : (
                        <>Verify and Initiate Claim <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const ArrowRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default ClaimAmount;
