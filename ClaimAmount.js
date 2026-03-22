import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { AlertCircle, DollarSign, X, ShieldAlert, Loader2 } from "lucide-react";


/** Date Input Component */
const DateInput = ({ name, value, onChange, placeholder }) => (
  <input
    type={value ? "date" : "text"}
    name={name}
    value={value || ""}
    onChange={onChange}
    onFocus={(e) => (e.target.type = "date")}
    onBlur={(e) => !e.target.value && (e.target.type = "text")}
    placeholder={placeholder}
    className="bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
  />
);

function ClaimAmount() {
  const navigate = useNavigate();
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    Policy_id: "", policy_start_date: "", incident_date: "", report_date: "",
    annual_premium: "", deductible: "", claim_amount: "",
    payment_method: "", channel: "", police_reported: "", injury_severity: "",
    num_prior_claims: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/predict", form);
      
      // ✅ LINKING LOGIC: If 0, navigate to Page B with a 'state'
      if (res.data.fraud_prediction === 0 || res.data.fraudclass === 0) {
        navigate("/customer/claim-status", { state: { autoApproved: true } });
      } else {
        // ❌ SHOW SUSPICIOUS ALERT
        setIsSuspicious(true);
      }
    } catch (err) {
      console.error("Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] font-mono text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col">
        <CustNavbar />
        <main className="p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto border border-white p-1">
            {isSuspicious ? (
              /* --- SUSPICIOUS VIEW --- */
              <div className="bg-black border border-white p-12 relative animate-in zoom-in">
                <button 
                  onClick={() => setIsSuspicious(false)} 
                  className="absolute top-4 right-4 border border-white p-2 hover:bg-white hover:text-black transition-all"
                >
                  <X size={20} />
                </button>
                <div className="text-center space-y-8">
                  <ShieldAlert size={80} className="mx-auto text-red-500" />
                  <h2 className="text-3xl font-black uppercase text-red-500">Security Alert</h2>
                  <div className="p-6 border border-red-500 bg-red-500/5">
                    <p className="text-lg uppercase font-bold">It seems that your claim is suspicious.</p>
                    <p className="text-xs text-gray-400 mt-2 uppercase">Please wait until admin reviews the claim.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* --- FORM VIEW --- */
              <div className="bg-[#111e32] border border-white">
                <div className="p-6 border-b border-white flex items-center gap-4">
                  <DollarSign size={24} />
                  <h2 className="text-xl font-bold uppercase tracking-widest">Claim Request Form</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input name="Policy_id" placeholder="Policy ID" onChange={handleChange} className="bg-[#1e293b]/50 border border-slate-700 p-3 rounded-lg" />
                  <DateInput name="policy_start_date" value={form.policy_start_date} onChange={handleChange} placeholder="Policy Start Date" />
                  {/* ... Add other fields here ... */}
                  <button type="submit" className="md:col-span-2 border border-white py-4 font-bold uppercase hover:bg-white hover:text-black transition-all">
                    {submitting ? <Loader2 className="animate-spin mx-auto" /> : "Analyze Claim"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClaimAmount;
