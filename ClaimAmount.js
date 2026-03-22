// import { useState, useMemo } from "react";
// import API from "../services/api";
// import CustSidebar from "../components/CustSidebar";
// import CustNavbar from "../components/CustNavbar";
// import { AlertCircle, DollarSign, X, ShieldAlert, Loader2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// /** Inline DateInput with Dark Styling */
// const DateInput = ({ name, value, onChange, placeholder = "mm/dd/yyyy", required = false, className = "", ...rest }) => {
//   const handleFocus = (e) => { e.target.type = "date"; };
//   const handleBlur = (e) => { if (!e.target.value) e.target.type = "text"; };
//   return (
//     <input
//       type={value ? "date" : "text"}
//       name={name}
//       value={value || ""}
//       onChange={onChange}
//       onFocus={handleFocus}
//       onBlur={handleBlur}
//       placeholder={placeholder}
//       required={required}
//       className={`bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 ${className}`}
//       {...rest}
//     />
//   );
// };

// const normalizeForm = (raw) => {
//   const clean = Object.fromEntries(
//     Object.entries(raw).map(([k, v]) => [k, v === "" ? null : v])
//   );
//   if (!clean.Policy_id && clean.Policy) { clean.Policy_id = clean.Policy; delete clean.Policy; }
//   if (typeof clean.police_reported === "string") { clean.police_reported = clean.police_reported === "Yes" ? "Yes" : "No"; }
//   ["annual_premium", "deductible", "claim_amount", "num_prior_claims"].forEach((f) => {
//     if (clean[f] !== null && clean[f] !== undefined && clean[f] !== "") { clean[f] = Number(clean[f]); }
//   });
//   return clean;
// };

// function ClaimAmount() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     Policy_id: "", policy_start_date: "", incident_date: "", report_date: "",
//     annual_premium: "", deductible: "", claim_amount: "",
//     payment_method: "", channel: "", police_reported: "", injury_severity: "",
//     num_prior_claims: "",
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [isSuspicious, setIsSuspicious] = useState(false); // FraudClass 1 state

//   const canSubmit = useMemo(() => {
//     return Object.values(form).every(val => val !== "");
//   }, [form]);

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     if (isSuspicious) setIsSuspicious(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       const payload = normalizeForm(form);
//       const res = await API.post("/predict", payload);
      
//       if (res.data.fraud_prediction === 0) {
//         // ✅ Redirect to Auto-Approval View
//         navigate("/customer/claim-status", { state: { autoApproved: true } });
//       } else {
//         // ❌ Show Suspicious View
//         setIsSuspicious(true);
//       }
//     } catch (error) {
//       console.error("Submission failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const selectClass = "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer";
//   const inputClass = "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500";

//   return (
//     <div className="flex min-h-screen bg-[#0a1628] font-mono">
//       <CustSidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <CustNavbar />
//         <main className="p-8 overflow-y-auto">
//           <div className="max-w-4xl mx-auto border border-white p-1">
            
//             {isSuspicious ? (
//               /* --- SUSPICIOUS MESSAGE VIEW --- */
//               <div className="bg-black border border-white p-12 relative animate-in zoom-in duration-300">
//                 <button 
//                   onClick={() => setIsSuspicious(false)} 
//                   className="absolute top-4 right-4 border border-white p-2 hover:bg-white hover:text-black transition-all"
//                 >
//                   <X size={20} />
//                 </button>
//                 <div className="text-center space-y-8">
//                   <ShieldAlert size={80} className="mx-auto text-red-500" />
//                   <div className="space-y-4">
//                     <h2 className="text-3xl font-black uppercase text-red-500 tracking-tighter">Security Alert</h2>
//                     <div className="p-6 border border-red-500 bg-red-500/5">
//                       <p className="text-lg uppercase font-bold text-white">It seems that your claim is suspicious.</p>
//                       <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-bold">
//                         Please wait until admin reviews the claim.
//                       </p>
//                     </div>
//                   </div>
//                   <p className="text-[10px] text-gray-800 uppercase">System_Flag: AUTH_REJ_V1</p>
//                 </div>
//               </div>
//             ) : (
//               /* --- DATA ENTRY FORM --- */
//               <div className="bg-[#111e32] border border-white">
//                 <div className="bg-[#1a2c46] p-6 text-white flex items-center gap-4 border-b border-white">
//                   <div className="bg-black p-3 border border-gray-700">
//                     <DollarSign className="text-white" size={24} />
//                   </div>
//                   <h2 className="text-xl font-bold uppercase tracking-widest">Claim Amount Request</h2>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <input type="text" name="Policy_id" placeholder="Policy ID" onChange={handleChange} value={form.Policy_id} className={inputClass} />
//                   <DateInput name="policy_start_date" value={form.policy_start_date} onChange={handleChange} placeholder="Policy Start Date" required />
//                   <DateInput name="incident_date" value={form.incident_date} onChange={handleChange} placeholder="Incident Date" required />
//                   <DateInput name="report_date" value={form.report_date} onChange={handleChange} placeholder="Report Date" required />
                  
//                   <input type="number" name="annual_premium" placeholder="Annual Premium" required onChange={handleChange} value={form.annual_premium} className={inputClass} />
//                   <input type="number" name="deductible" placeholder="Deductible" required onChange={handleChange} value={form.deductible} className={inputClass} />
//                   <input type="number" name="claim_amount" placeholder="Claim Amount" required onChange={handleChange} value={form.claim_amount} className={inputClass} />
                  
//                   <select name="payment_method" required onChange={handleChange} value={form.payment_method} className={selectClass}>
//                     <option value="">Payment Method</option>
//                     <option>Cash</option><option>Crypto</option><option>Bank</option>
//                   </select>

//                   <select name="channel" required onChange={handleChange} value={form.channel} className={selectClass}>
//                     <option value="">Channel</option>
//                     <option>Agent</option><option>Online</option>
//                   </select>

//                   <select name="police_reported" required onChange={handleChange} value={form.police_reported} className={selectClass}>
//                     <option value="">Police Reported</option>
//                     <option>Yes</option><option>No</option>
//                   </select>

//                   <select name="injury_severity" required onChange={handleChange} value={form.injury_severity} className={selectClass}>
//                     <option value="">Injury Severity</option>
//                     <option>None</option><option>Normal</option><option>Critical</option><option>Major</option>
//                   </select>

//                   <input type="number" name="num_prior_claims" placeholder="Prior Claims Count" required onChange={handleChange} value={form.num_prior_claims} className={`${inputClass} md:col-span-2`} />

//                   <div className="md:col-span-2 pt-6">
//                     <button
//                       type="submit"
//                       disabled={submitting || !canSubmit}
//                       className="w-full border border-white py-4 font-bold uppercase hover:bg-white hover:text-black transition-all flex justify-center items-center gap-3"
//                     >
//                       {submitting ? <Loader2 className="animate-spin" /> : "Verify and Submit Claim"}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default ClaimAmount;
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
