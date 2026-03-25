import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import {
 DollarSign,
 Loader2,
 ArrowRight,
 FileText,
 CalendarDays,
 UserCog,
 Clock3,
 AlertTriangle
} from "lucide-react";
import { toast } from "react-toastify";
const ModernDateInput = ({ name, value, onChange, label, icon: Icon }) => (
<div className="flex flex-col gap-1.5">
<label className="text-xs font-medium text-slate-400 flex items-center gap-2">
<Icon size={14} className="text-blue-400" />
     {label}
</label>
<input
     type="date"
     name={name}
     value={value || ""}
     max={new Date().toISOString().split("T")[0]}
     onChange={onChange}
     className="bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm w-full"
     required
   />
</div>
);
const ModernSelect = ({ name, value, onChange, label, children, icon: Icon }) => (
<div className="flex flex-col gap-1.5">
<label className="text-xs font-medium text-slate-400 flex items-center gap-2">
<Icon size={14} className="text-blue-400" />
     {label}
</label>
<div className="relative">
<select
       name={name}
       value={value}
       onChange={onChange}
       required
       className="bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm w-full appearance-none cursor-pointer pr-10"
>
       {children}
</select>
<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
       ▼
</div>
</div>
</div>
);
function ClaimAmount() {
 const navigate = useNavigate();
 const [submitting, setSubmitting] = useState(false);
 const [isSuspicious, setIsSuspicious] = useState(false);
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
 const validateDates = () => {
   const today = new Date();
   const start = new Date(form.policy_start_date);
   const incident = new Date(form.incident_date);
   const report = new Date(form.report_date);
   if (start > today || incident > today || report > today) {
     toast.error("Dates cannot be in the future.");
     return false;
   }
   if (incident < start) {
     toast.error("Incident date must be on or after the Policy Start date.");
     return false;
   }
   if (report < incident) {
     toast.error("Reporting date must be on or after the Incident date.");
     return false;
   }
   return true;
 };
 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!validateDates()) return;
   setSubmitting(true);
   const autoID = localStorage.getItem("customer_id") || "CUST_DEFAULT";
   const payload = { ...form, customer_id: autoID };
   try {
     // 1. Get AI Prediction
     const res = await API.post("/predict", payload);
     if (res.data.fraud_prediction === 0) {
       // ✅ Verified Claim Path
       toast.success("Initial Verification Passed");
       navigate("/customer/predict-claim", {
         state: { autoApproved: true, ...form }
       });
     } else {
       // ❌ Suspicious Claim Path
       // 2. Notify Admin via Backend (Saves to false_claims table)
       await API.post("/customer/false-claim", {
         customer_id: autoID,
         policy_id: form.Policy_id,
         reason: "AI detected suspicious claim",
         claim_amount: form.claim_amount
       });
       // 3. Update UI to show the "Awaiting Review" screen
       setIsSuspicious(true);
       toast.warning("Claim flagged for manual admin review.");
     }
   } catch (err) {
     console.error("Verification Engine Failure", err);
     toast.error("Verification system error.");
   } finally {
     setSubmitting(false);
   }
 };
 const inputClass = "bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-sm";
 const labelClass = "text-xs font-medium text-slate-400 flex items-center gap-2";
 return (
<div className="flex min-h-screen bg-slate-950 font-sans text-white">
<CustSidebar />
<div className="flex-1 flex flex-col overflow-hidden">
<CustNavbar />
<main className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-900">
<div className="max-w-5xl mx-auto">
           {isSuspicious ? (
<div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 text-center shadow-xl animate-in fade-in zoom-in duration-300">
<div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6">
<Clock3 size={40} className="text-amber-400" />
</div>
<h2 className="text-2xl font-bold">Verification Pending</h2>
<p className="text-slate-400 mt-2 max-w-sm mx-auto text-sm">
                 This claim requires manual review by our administration team. You will be notified once the review is complete.
</p>
<div className="mt-8 flex justify-center gap-4">
<button onClick={() => setIsSuspicious(false)} className="text-sm text-slate-400 hover:text-white underline">Edit Form</button>
<button onClick={() => navigate("/customer/dashboard")} className="bg-blue-600 px-6 py-2 rounded-lg text-sm font-bold">Back to Home</button>
</div>
</div>
           ) : (
<div className="bg-slate-800/50 border border-slate-700 rounded-3xl shadow-xl overflow-hidden">
<div className="p-6 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3">
<FileText className="text-blue-400" />
<h2 className="text-lg font-bold tracking-tight">Policy Claim Request</h2>
</div>
<form onSubmit={handleSubmit} className="p-8 space-y-8">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="flex flex-col gap-1.5 md:col-span-2">
<label className={labelClass}><FileText size={14} className="text-blue-400" />Policy ID</label>
<input type="text" name="Policy_id" placeholder="Enter Policy ID" onChange={handleChange} value={form.Policy_id} className={inputClass} required />
</div>
<ModernDateInput name="policy_start_date" value={form.policy_start_date} onChange={handleChange} label="Policy Start Date" icon={CalendarDays} />
<ModernDateInput name="incident_date" value={form.incident_date} onChange={handleChange} label="Incident Occurrence" icon={CalendarDays} />
<ModernDateInput name="report_date" value={form.report_date} onChange={handleChange} label="Official Report Date" icon={CalendarDays} />
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
<div className="flex flex-col gap-1.5"><label className={labelClass}>Annual Premium</label>
<input type="number" name="annual_premium" placeholder="0.00" required onChange={handleChange} value={form.annual_premium} className={inputClass} /></div>
<div className="flex flex-col gap-1.5"><label className={labelClass}>Deductible</label>
<input type="number" name="deductible" placeholder="0.00" required onChange={handleChange} value={form.deductible} className={inputClass} /></div>
<div className="flex flex-col gap-1.5"><label className={labelClass}>Claim Amount</label>
<input type="number" name="claim_amount" placeholder="0.00" required onChange={handleChange} value={form.claim_amount} className={inputClass} /></div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
<ModernSelect name="payment_method" onChange={handleChange} value={form.payment_method} label="Payment Method" icon={DollarSign}>
<option value="">Select Method</option><option>Cash</option><option>Crypto</option><option>Bank Transfer</option>
</ModernSelect>
<ModernSelect name="channel" onChange={handleChange} value={form.channel} label="Submission Channel" icon={FileText}>
<option value="">Select Channel</option><option>Agent</option><option>Online</option>
</ModernSelect>
<ModernSelect name="police_reported" onChange={handleChange} value={form.police_reported} label="Police Reported?" icon={AlertTriangle}>
<option value="">Select Option</option><option>Yes</option><option>No</option>
</ModernSelect>
<ModernSelect name="injury_severity" onChange={handleChange} value={form.injury_severity} label="Injury Severity" icon={AlertTriangle}>
<option value="">Select Severity</option><option>None</option><option>Normal</option><option>Critical</option><option>Major</option>
</ModernSelect>
<div className="flex flex-col gap-1.5 md:col-span-2"><label className={labelClass}><UserCog size={14} className="text-blue-400" />Prior Claims</label>
<input type="number" name="num_prior_claims" placeholder="0" required onChange={handleChange} value={form.num_prior_claims} className={inputClass} /></div>
</div>
<button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 group">
                   {submitting ? <Loader2 className="animate-spin" size={18} /> : <>Verify Claim <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
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
