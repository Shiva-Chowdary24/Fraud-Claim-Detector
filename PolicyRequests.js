import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import {
 CheckCircle,
 XCircle,
 User,
 Activity,
 Wallet,
 Clock,
 ShieldCheck,
 ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
function PolicyRequests() {
 const [requests, setRequests] = useState([]);
 const [loading, setLoading] = useState(true);
 const fetchRequests = async () => {
   try {
     const res = await API.get("/admin/policy-requests");
     setRequests(res.data);
   } catch {
     toast.error("Failed to load requests from server");
   } finally {
     setLoading(false);
   }
 };
 useEffect(() => {
   fetchRequests();
 }, []);
 const handleApprove = async (id) => {
   try {
     const res = await API.post(`/admin/policy-approve/${id}`);
     toast.success(`Approved! Policy ID: ${res.data.policy_id}`);
     setRequests((prev) => prev.filter((r) => r._id !== id));
   } catch {
     toast.error("Could not complete approval");
   }
 };
 const handleDecline = async (id) => {
   try {
     await API.post(`/admin/policy-decline/${id}`);
     toast.warn("Application Declined");
     setRequests((prev) => prev.filter((r) => r._id !== id));
   } catch {
     toast.error("Action failed");
   }
 };
 return (
<AdminLayout>
<div className="max-w-6xl mx-auto px-4 pb-20">
       {/* Header Section with enhanced spacing */}
<header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h2 className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
<div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
<ShieldCheck className="text-blue-500" size={32} />
</div>
             Policy Approvals
</h2>
<p className="text-slate-400 mt-3 text-base max-w-md">
             Underwrite and verify customer insurance applications with real-time risk assessment.
</p>
</div>
<div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-full border border-slate-700/50">
<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
<span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
             {requests.length} Pending Actions
</span>
</div>
</header>
       {loading ? (
<div className="flex flex-col items-center justify-center py-32 gap-4">
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
<span className="text-slate-500 font-medium animate-pulse">Syncing Ledger...</span>
</div>
       ) : requests.length === 0 ? (
<div className="bg-[#111e32]/40 border-2 border-dashed border-slate-800 rounded-[3rem] p-24 text-center transition-all hover:border-slate-700">
<Clock className="mx-auto text-slate-800 mb-6" size={64} />
<p className="text-slate-400 text-xl font-medium">Queue is empty.</p>
<p className="text-slate-600 text-sm mt-2">All applications have been processed.</p>
</div>
       ) : (
<div className="flex flex-col gap-8">
           {requests.map((req) => {
             const isDividend = req.policy_mode === "DIVIDEND";
             return (
<div
                 key={req._id}
                 className={`group relative overflow-hidden transition-all duration-500 hover:translate-y-[-4px]
                   bg-[#0f172a] border rounded-[2.5rem] shadow-2xl
                   ${isDividend ? "border-emerald-500/20 hover:border-emerald-500/50" : "border-slate-800 hover:border-blue-500/50"}`}
>
                 {/* Subtle Accent Glow */}
<div className={`absolute top-0 left-0 w-1 h-full ${isDividend ? "bg-emerald-500" : "bg-blue-500"}`} />
<div className="p-8 md:p-10">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 items-center">
                     {/* 1. Applicant Profile */}
<div className="lg:col-span-3">
<div className="flex items-center gap-3 mb-4">
<div className="p-2 bg-blue-500/10 rounded-lg">
<User size={16} className="text-blue-400" />
</div>
<span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Applicant Details</span>
</div>
<h3 className="text-white font-bold text-2xl tracking-tight leading-none mb-1">
                         {req.full_name}
</h3>
<p className="text-slate-500 text-sm font-medium">{req.email}</p>
</div>
                     {/* 2. Financial Standing */}
<div className="lg:col-span-2">
<div className="flex items-center gap-3 mb-4">
<div className="p-2 bg-emerald-500/10 rounded-lg">
<Wallet size={16} className="text-emerald-400" />
</div>
<span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Financials</span>
</div>
<p className="text-emerald-400 font-mono text-xl font-bold italic">
                         ₹{Number(req.annual_income).toLocaleString()}
</p>
<p className="text-slate-400 text-xs font-bold uppercase mt-1">{req.occupation}</p>
</div>
                     {/* 3. Medical Report */}
<div className="lg:col-span-4">
<div className="flex items-center gap-3 mb-4">
<div className="p-2 bg-red-500/10 rounded-lg">
<Activity size={16} className="text-red-400" />
</div>
<span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Underwriting Notes</span>
</div>
<div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-h-[60px] flex items-center">
<p className="text-slate-300 text-sm italic leading-relaxed">
                           {req.medical_history ? `"${req.medical_history}"` : "No medical disclosures reported."}
</p>
</div>
</div>
                     {/* 4. Action Decision */}
<div className="lg:col-span-3 flex flex-col items-center lg:items-end gap-4">
<div className="text-right">
<div className={`text-xs font-black px-3 py-1 rounded-full border mb-2 inline-block
                           ${isDividend
                             ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                             : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                           {req.plan_name} • {req.policy_mode}
</div>
</div>
<div className="flex items-center gap-3 w-full">
<button
                           onClick={() => handleApprove(req._id)}
                           className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black text-white transition-all
                             active:scale-95 shadow-lg
                             ${isDividend
                               ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
                               : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"}`}
>
<CheckCircle size={18} /> APPROVE
</button>
<button
                           onClick={() => handleDecline(req._id)}
                           className="p-4 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-700"
                           title="Decline Application"
>
<XCircle size={20} />
</button>
</div>
</div>
</div>
</div>
                 {/* Metadata Footer */}
<div className="bg-slate-900/60 px-10 py-4 flex flex-wrap justify-between items-center gap-4 border-t border-white/5">
<div className="flex items-center gap-6">
<span className="flex items-center gap-2 text-[11px] text-slate-400 font-bold tracking-wider">
<Clock size={14} className="text-slate-600" />
                       TERM: <span className="text-white">{req.tenure} YEARS</span>
</span>
<span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-700" />
<span className="flex items-center gap-2 text-[11px] text-slate-400 font-bold tracking-wider">
<User size={14} className="text-slate-600" />
                       NOMINEE: <span className="text-white">{req.nominee_name.toUpperCase()}</span>
<span className="text-slate-600 font-medium">({req.nominee_relation})</span>
</span>
</div>
<div className="text-[10px] text-slate-600 font-black italic flex items-center gap-1 group-hover:text-slate-400 transition-colors">
                     VERIFY DOCUMENTATION <ChevronRight size={12} />
</div>
</div>
</div>
             );
           })}
</div>
       )}
</div>
</AdminLayout>
 );
}
export default PolicyRequests;
