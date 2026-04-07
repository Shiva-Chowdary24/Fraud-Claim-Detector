// import { useEffect, useState } from "react";
// import API from "../services/api";
// import CustSidebar from "../components/CustSidebar";
// import CustNavbar from "../components/CustNavbar";
// import { toast } from "react-toastify";
// import { ShieldCheck, Clock, ChevronDown, ChevronUp, CreditCard, Info } from "lucide-react";

// function CustIssuedPolicies() {
//   const [policies, setPolicies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedId, setExpandedId] = useState(null);

//   // Retrieve auth data from localStorage
//   const customerId = localStorage.getItem("customer_id");
//   const userRole = localStorage.getItem("role");

//   useEffect(() => {
//     const fetchPolicies = async () => {
//       try {
//         setLoading(true);
        
//         // Debugging logs - check these in F12 console
//         console.log("Fetching policies for ID:", customerId);
//         console.log("User Role being sent:", userRole);

//         // ✅ URL must match your @router.get in customer.py
//         const res = await API.get(`/customer/issued-policies`, {
//           params: { customer_id: customerId }, // Sends as ?customer_id=...
//           headers: { 
//             "role": userRole // Sends security header
//           }
//         });
        
//         console.log("Response from server:", res.data);
//         setPolicies(res.data);
//       } catch (err) {
//         console.error("Fetch Error Details:", err.response || err);
        
//         if (err.response?.status === 403) {
//           toast.error("Security access denied. Please re-login.");
//         } else {
//           toast.error("Failed to load policies. Server might be down.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (customerId && userRole) {
//       fetchPolicies();
//     } else {
//       setLoading(false);
//       console.warn("Missing credentials in localStorage");
//     }
//   }, [customerId, userRole]);

//   const handlePayment = (policyId, amount) => {
//     toast.info(`Redirecting to payment gateway for $${amount}...`);
//   };

//   const toggleExpand = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   return (
//     <div className="flex min-h-screen bg-[#0a1628] text-white">
//       <CustSidebar />
//       <div className="flex-1 flex flex-col h-screen overflow-hidden">
//         <CustNavbar />
//         <main className="flex-1 p-8 overflow-y-auto">
//           <header className="mb-10 text-left">
//             <h1 className="text-4xl font-black text-white tracking-tight">My Issued Policies</h1>
//             <p className="text-slate-400 text-sm mt-2">View your active protection and manage installments.</p>
//           </header>

//           {loading ? (
//             <div className="flex justify-center py-20">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
//             </div>
//           ) : !policies || policies.length === 0 ? (
//             <div className="bg-[#111e32]/50 border border-dashed border-slate-800 rounded-[2.5rem] p-20 text-center shadow-2xl">
//               <ShieldCheck size={56} className="mx-auto text-slate-700 mb-4" />
//               <p className="text-slate-400 font-medium tracking-tight text-lg">No active policies found.</p>
//               <p className="text-slate-600 text-sm mt-1">Once your application is approved, it will appear here.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
//               {policies.map((policy) => (
//                 <div key={policy._id || policy.policy_id} className="bg-[#111e32]/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden transition-all hover:border-blue-500/30">
                  
//                   {/* Card Header */}
//                   <div className="bg-[#1a2c46] p-6 flex justify-between items-center border-b border-slate-800">
//                     <div className="text-left">
//                       <p className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.2em]">Policy Number</p>
//                       <h3 className="text-xl font-black text-blue-400 tracking-tighter">{policy.policy_id}</h3>
//                     </div>
//                     <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest">
//                       Active
//                     </div>
//                   </div>

//                   {/* Main Summary */}
//                   <div className="p-8 space-y-6 text-left">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Plan</span>
//                         <span className="text-white font-bold">{policy.plan_name}</span>
//                       </div>
//                       <div>
//                         <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tenure</span>
//                         <span className="text-white font-bold">{policy.tenure} Years</span>
//                       </div>
//                       <div className="col-span-2">
//                         <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Premium Status</span>
//                         <span className="text-orange-400 font-bold text-xs flex items-center gap-1">
//                           <Clock size={12} /> Installment Pending
//                         </span>
//                       </div>
//                     </div>

//                     <div className="pt-4 flex gap-3">
//                       <button 
//                         onClick={() => toggleExpand(policy.policy_id)}
//                         className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all border border-slate-700"
//                       >
//                         {expandedId === policy.policy_id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
//                         {expandedId === policy.policy_id ? "Hide Details" : "Know More"}
//                       </button>
//                     </div>

//                     {expandedId === policy.policy_id && (
//                       <div className="mt-4 p-6 bg-black/30 rounded-3xl border border-slate-800/50 space-y-4 animate-in fade-in duration-300">
//                         <div className="flex items-start gap-3">
//                           <Info size={16} className="text-blue-500 mt-1 shrink-0" />
//                           <div>
//                             <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Coverage Info</p>
//                             <p className="text-xs text-slate-400 leading-relaxed">
//                               Annual Premium: <strong>₹{policy.premium_amount || policy.premium}</strong>. <br/>
//                               Approved on: {policy.approved_at ? new Date(policy.approved_at).toLocaleDateString() : 'N/A'}
//                             </p>
//                           </div>
//                         </div>
                        
//                         <button 
//                           onClick={() => handlePayment(policy.policy_id, policy.premium_amount || policy.premium)}
//                           className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
//                         >
//                           <CreditCard size={18} /> Pay Premium (₹{policy.premium_amount || policy.premium})
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default CustIssuedPolicies;
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
