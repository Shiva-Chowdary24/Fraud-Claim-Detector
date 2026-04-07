import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import {
 ShieldCheck,
 Clock,
 ChevronDown,
 ChevronUp,
 CreditCard,
 Info,
 Calendar
} from "lucide-react";
function CustIssuedPolicies() {
 const [policies, setPolicies] = useState([]);
 const [loading, setLoading] = useState(true);
 // ✅ Keeps multiple boxes open independently
 const [expandedIds, setExpandedIds] = useState([]);
 const customerId = localStorage.getItem("customer_id");
 const userRole = localStorage.getItem("role");
 useEffect(() => {
   const fetchPolicies = async () => {
     try {
       setLoading(true);
       const res = await API.get(`/customer/issued-policies`, {
         params: { customer_id: customerId },
         headers: { "role": userRole }
       });
       setPolicies(res.data);
     } catch (err) {
       toast.error("Failed to load policies.");
     } finally {
       setLoading(false);
     }
   };
   if (customerId && userRole) fetchPolicies();
 }, [customerId, userRole]);
 const toggleExpand = (id) => {
   setExpandedIds((prev) =>
     prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
   );
 };
 return (
<div className="flex min-h-screen bg-[#0a1628] text-white">
<CustSidebar />
<div className="flex-1 flex flex-col h-screen overflow-hidden">
<CustNavbar />
<main className="flex-1 p-10 overflow-y-auto custom-scrollbar">
<header className="mb-10 text-left">
<h1 className="text-4xl font-black text-white tracking-tight">My Issued Policies</h1>
<p className="text-slate-400 text-sm mt-2">Manage your active protection and track policy milestones.</p>
</header>
         {loading ? (
<div className="flex justify-center py-20 animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
         ) : (
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
             {policies.map((policy) => {
               // ✅ LOGIC: Check if it's a Dividend plan
               const isDividend = policy.plan_name?.toUpperCase().includes("DIVIDEND") || policy.policy_mode?.toUpperCase() === "DIVIDEND";
               const isExpanded = expandedIds.includes(policy._id);
               return (
<div
                   key={policy._id}
                   className={`rounded-[2.5rem] shadow-2xl border transition-all duration-500 bg-[#111e32]/80 backdrop-blur-md
                     ${isExpanded ? "scale-[1.01]" : ""}
                     ${isDividend ? "border-emerald-500 shadow-emerald-900/20" : "border-slate-800 shadow-black/50"}`}
                   style={isDividend ? { borderColor: '#10b981' } : {}}
>
                   {/* Header Section */}
<div className="p-8 flex justify-between items-start border-b border-white/5">
<div className="text-left">
<p className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.2em] mb-1">Policy Number</p>
<h3 className={`text-2xl font-black tracking-tighter ${isDividend ? "text-emerald-400" : "text-blue-400"}`}>
                         {policy.policy_id}
</h3>
                       {/* ✅ ADDED: Issued Date */}
<div className="flex items-center gap-2 mt-1 text-slate-500">
<Calendar size={12} />
<span className="text-[10px] font-bold uppercase tracking-tighter">
                            Issued: {policy.approved_at ? new Date(policy.approved_at).toLocaleDateString() : 'N/A'}
</span>
</div>
</div>
<div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                       ${isDividend ? "bg-emerald-500/10 text-emerald-400 border-emerald-500" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                       {isDividend ? "DIVIDEND" : "ACTIVE"}
</div>
</div>
<div className="px-8 pb-8 space-y-6 text-left mt-6">
<div className="grid grid-cols-2 gap-4">
<div>
<span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Plan</span>
<span className="text-white font-bold text-lg">{policy.plan_name}</span>
</div>
<div>
<span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tenure</span>
<span className="text-white font-bold text-lg">{policy.tenure} Years</span>
</div>
                       {/* ✅ ADDED: Premium Status (Always visible) */}
<div className="col-span-2">
<span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Premium Status</span>
<span className="text-orange-400 font-bold text-xs flex items-center gap-2">
<Clock size={14} className="animate-pulse" />
                           Installment Pending
</span>
</div>
</div>
                     {/* View Details Button */}
<button
                       onClick={() => toggleExpand(policy._id)}
                       className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border
                         ${isExpanded
                           ? "bg-white text-slate-900 border-white"
                           : "bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
>
                       {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                       {isExpanded ? "Hide Details" : "Know More"}
</button>
                     {/* Expandable Section */}
                     {isExpanded && (
<div className="mt-4 p-6 bg-black/30 rounded-[1.8rem] border border-slate-800/50 space-y-4 animate-in fade-in zoom-in duration-200">
<div className="flex items-start gap-3">
<Info size={16} className={isDividend ? "text-emerald-500" : "text-blue-500"} />
<div>
<p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Financial Summary</p>
<p className="text-xs text-slate-400 leading-relaxed">
                               Premium Amount: <strong>₹{(policy.premium_amount || 0).toLocaleString()}</strong>. <br/>
                               This policy covers accidental damages as per the terms signed.
</p>
</div>
</div>
<button
                           className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95
                             ${isDividend ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"}`}
>
<CreditCard size={18} /> Pay Installment (₹{(policy.premium_amount || 0).toLocaleString()})
</button>
</div>
                     )}
</div>
</div>
               );
             })}
</div>
         )}
</main>
</div>
</div>
 );
}
export default CustIssuedPolicies;
