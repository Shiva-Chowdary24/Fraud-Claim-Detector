import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { Loader2, CheckCircle, Sparkles, Frown } from "lucide-react";
import { toast } from "react-toastify";
function AmountPredict() {
 const navigate = useNavigate();
 const [policyIdInput, setPolicyIdInput] = useState("");
 const [loading, setLoading] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [predictedAmount, setPredictedAmount] = useState(null);
 const [isFetched, setIsFetched] = useState(false);
 const [rejectionReasons, setRejectionReasons] = useState(null);
 // ✅ Exact Schema for Backend (19 Fields)
 const [formData, setFormData] = useState({
   policy_id: "",
   age: "",
   policy_tenure_years: "",
   prior_claims_count: "",
   incident_severity: "",
   region_risk_level: "",
   bmi: "",
   bloodpressure: "",
   diabetes: "",
   hereditary_diseases: "",
   smoker: "",
   regular_ex: "",
   weight: "",
   health_risk_score: "",
   policy_coverage_details: "",
   sum_assured: "",
   annual_premium: "",
   payment_frequency: "",
   gender: ""
 });
 const inputClass = "w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all";
 /* =====================================================
    🔍 FETCH POLICY DETAILS
    ===================================================== */
 const handleLookup = async () => {
   if (!policyIdInput) return toast.error("Enter Policy ID");
   setLoading(true);
   try {
     const res = await API.get(`/customer/policy-details/${policyIdInput}`);
     const d = res.data;
     // Robust fallback mapping for premium and sum assured
     const fetchedPremium = d.annual_premium ?? d.premium_amount ?? d.premium ?? 0;
     const fetchedSumAssured = d.sum_assured ?? d.coverage_amount ?? d.total_claim_amount ?? 0;
     setFormData(prev => ({
       ...prev,
       policy_id: policyIdInput,
       policy_tenure_years: Number(d.tenure ?? d.policy_tenure_years ?? 0),
       sum_assured: Number(fetchedSumAssured),
       annual_premium: Number(fetchedPremium)
     }));
     setIsFetched(true);
     toast.success("Policy details loaded");
   } catch {
     toast.error("Policy not found");
   } finally {
     setLoading(false);
   }
 };
 const handleChange = e =>
   setFormData({ ...formData, [e.target.name]: e.target.value });
 /* =====================================================
    🔮 PREDICT & STORE CLAIM (Core Logic Maintained)
    ===================================================== */
 const handlePredict = async e => {
   e.preventDefault();
   setSubmitting(true);
   try {
     // 1. Get Prediction from AI Model
     const res = await API.post("/predict-health", {
       ...formData,
       age: Number(formData.age),
       weight: Number(formData.weight),
       bmi: Number(formData.bmi),
       bloodpressure: Number(formData.bloodpressure),
       prior_claims_count: Number(formData.prior_claims_count),
       diabetes: Number(formData.diabetes),
       smoker: Number(formData.smoker),
       regular_ex: Number(formData.regular_ex),
       health_risk_score: Number(formData.health_risk_score),
       sum_assured: Number(formData.sum_assured),
       annual_premium: Number(formData.annual_premium)
     });
     if (res.data.approved === "Yes") {
       const amount = res.data.claimable_amount;
       // 2. NEW: Push to Collection (Storage)
       try {
         await API.post("/customer/amount-predict/store", {
           policy_id: formData.policy_id,
           claimable_amount: Number(amount),
           status: "Active"
         });
         console.log("Prediction stored in database successfully");
       } catch (storeError) {
         console.error("Storage failed:", storeError);
         toast.warning("Prediction ready, but failed to save to history.");
       }
       setRejectionReasons(null);
       setPredictedAmount(amount);
       // 🎉 UI Feedback
       confetti({ particleCount: 150, spread: 70 });
       setTimeout(() => navigate("/customer/claim-policies"), 5000);
     } else {
       const reasons = res.data.rejection_reasons || ["Claim rejected"];
       reasons.forEach(r => toast.error(r));
       setPredictedAmount(null);
       setRejectionReasons(reasons);
     }
   } catch (err) {
     toast.error("Prediction failed");
   } finally {
     setSubmitting(false);
   }
 };
 /* =======================
    Modal UI Helpers
    ======================= */
 const ModalBackdrop = () => (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
 );
 const ModalCard = ({ children }) => (
<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg mx-4 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e172a] to-[#0b1220] shadow-2xl overflow-hidden">
<div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-400" />
<div className="px-8 py-10 text-center">{children}</div>
</div>
 );
 return (
<div className="flex min-h-screen bg-[#050b18] text-white">
<CustSidebar />
<div className="flex-1 flex flex-col">
<CustNavbar />
       {/* Success Modal */}
       {predictedAmount !== null && (
<>
<ModalBackdrop />
<ModalCard>
<div className="mx-auto mb-6 w-16 h-16 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
<CheckCircle size={36} className="text-emerald-400" />
</div>
<h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Congratulations!</h2>
<div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
<p className="text-sm text-slate-300">Claimable amount up to</p>
<p className="mt-2 text-4xl md:text-5xl font-black tracking-tight">
                 ₹{Number(predictedAmount).toLocaleString()}
</p>
</div>
<button
               onClick={() => navigate("/customer/claim-policies")}
               className="mt-6 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold uppercase tracking-widest transition-all"
>
               Go to history
</button>
</ModalCard>
</>
       )}
       {/* Rejection Modal */}
       {Array.isArray(rejectionReasons) && rejectionReasons.length > 0 && (
<>
<ModalBackdrop />
<ModalCard>
<div className="mx-auto mb-6 w-16 h-16 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center">
<Frown size={36} className="text-red-400" />
</div>
<h2 className="text-2xl font-bold text-red-300">We’re sorry</h2>
<div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
<ul className="list-disc list-inside space-y-2">
                 {rejectionReasons.map((r, idx) => (
<li key={idx} className="text-slate-200 text-sm">{r}</li>
                 ))}
</ul>
</div>
<button
               onClick={() => setRejectionReasons(null)}
               className="mt-6 w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold"
>
               Close
</button>
</ModalCard>
</>
       )}
<main className="p-8 max-w-6xl mx-auto w-full">
<div className="flex gap-4 mb-6">
<input
             className={inputClass}
             placeholder="Policy ID"
             value={policyIdInput}
             onChange={e => setPolicyIdInput(e.target.value)}
           />
<button
             onClick={handleLookup}
             className="bg-blue-600 px-8 rounded-xl font-semibold disabled:opacity-50"
             disabled={loading}
>
             {loading ? <Loader2 className="animate-spin" /> : "Fetch"}
</button>
</div>
         {isFetched && (
<form onSubmit={handlePredict} className="animate-in fade-in duration-500">
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
<div className="bg-white/5 p-3 rounded-xl border border-white/10">
<p className="text-[10px] text-slate-500 uppercase font-bold">Tenure</p>
<p className="text-sm">{formData.policy_tenure_years} yrs</p>
</div>
<div className="bg-white/5 p-3 rounded-xl border border-white/10">
<p className="text-[10px] text-slate-500 uppercase font-bold">Sum Assured</p>
<p className="text-sm">₹{formData.sum_assured.toLocaleString()}</p>
</div>
<div className="bg-white/5 p-3 rounded-xl border border-white/10">
<p className="text-[10px] text-slate-500 uppercase font-bold">Annual Premium</p>
<p className="text-sm">₹{formData.annual_premium.toLocaleString()}</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<input name="age" type="number" onChange={handleChange} placeholder="Age" className={inputClass} required />
<input name="weight" type="number" onChange={handleChange} placeholder="Weight (kg)" className={inputClass} required />
<input name="bmi" type="number" step="0.1" onChange={handleChange} placeholder="BMI" className={inputClass} required />
<input name="bloodpressure" type="number" onChange={handleChange} placeholder="Blood Pressure" className={inputClass} required />
<input name="prior_claims_count" type="number" onChange={handleChange} placeholder="Prior Claims Count" className={inputClass} required />
<select name="diabetes" onChange={handleChange} className={inputClass} required>
<option value="">Diabetes?</option>
<option value="1">Yes</option>
<option value="0">No</option>
</select>
<select name="smoker" onChange={handleChange} className={inputClass} required>
<option value="">Smoker?</option>
<option value="1">Yes</option>
<option value="0">No</option>
</select>
<select name="regular_ex" onChange={handleChange} className={inputClass} required>
<option value="">Regular Exercise?</option>
<option value="1">Yes</option>
<option value="0">No</option>
</select>
<input name="health_risk_score" type="number" step="0.1" onChange={handleChange} placeholder="Health Risk Score" className={inputClass} required />
<input name="hereditary_diseases" onChange={handleChange} placeholder="Hereditary Diseases" className={inputClass} />
<select name="incident_severity" onChange={handleChange} className={inputClass} required>
<option value="">Incident Severity</option>
<option value="Low">Low</option>
<option value="Medium">Medium</option>
<option value="High">High</option>
</select>
<select name="region_risk_level" onChange={handleChange} className={inputClass} required>
<option value="">Region Risk Level</option>
<option value="Low">Low</option>
<option value="Medium">Medium</option>
<option value="High">High</option>
</select>
<select name="policy_coverage_details" onChange={handleChange} className={inputClass} required>
<option value="">Coverage Type</option>
<option value="Individual">Individual</option>
<option value="Family">Family</option>
</select>
<select name="payment_frequency" onChange={handleChange} className={inputClass} required>
<option value="">Payment Frequency</option>
<option value="Annual">Annual</option>
<option value="Monthly">Monthly</option>
</select>
<select name="gender" onChange={handleChange} className={inputClass} required>
<option value="">Gender</option>
<option value="Male">Male</option>
<option value="Female">Female</option>
</select>
</div>
<button className="mt-6 w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20">
               {submitting ? <Loader2 className="animate-spin mx-auto" /> : "Predict & Save Claim Amount"}
</button>
</form>
         )}
</main>
</div>
</div>
 );
}
export default AmountPredict;
