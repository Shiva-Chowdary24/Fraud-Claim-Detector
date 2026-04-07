import React, { useEffect, useState } from "react";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import {
 MessageSquare,
 Clock,
 CheckCircle2,
 HelpCircle,
 Loader2,
 AlertCircle,
 RefreshCw,
 Info,
} from "lucide-react";
import { toast } from "react-toastify";
function CustSupportHistory() {
 const [history, setHistory] = useState([]);
 const [loading, setLoading] = useState(true);
 const [debug, setDebug] = useState({
   email: "",
   encodedEmail: "",
   url: "",
   lastFetchedAt: "",
 });
 const fetchHistory = async () => {
   setLoading(true);
   try {
     let rawEmail = localStorage.getItem("user_email");
     let email = (rawEmail || "").trim().toLowerCase();
     if (!email) {
       const rawCid = localStorage.getItem("customer_id");
       const customerId = (rawCid || "").trim();
       if (customerId) {
         try {
           const resolveRes = await API.get(
             `/customer/resolve-email/${encodeURIComponent(customerId)}`
           );
           email = (resolveRes?.data?.email || "").trim().toLowerCase();
           if (email) {
             localStorage.setItem("user_email", email);
           }
         } catch (e) {}
       }
     }
     if (!email) {
       toast.error("User email not found.");
       setHistory([]);
       return;
     }
     const encodedEmail = encodeURIComponent(email);
     const path = `/customer/queries/${encodedEmail}`;
     const url = API?.defaults?.baseURL ? API.defaults.baseURL + path : path;
     const res = await API.get(path);
     const data = Array.isArray(res.data) ? res.data : [];
     setHistory(data);
     setDebug({
       email,
       encodedEmail,
       url,
       lastFetchedAt: new Date().toLocaleTimeString(),
     });
   } catch (err) {
     toast.error("Could not load history.");
     setHistory([]);
   } finally {
     setLoading(false);
   }
 };
 useEffect(() => {
   fetchHistory();
 }, []);
 // UI Component Styles
 const cardStyle = "bg-[#111e32]/50 border border-white/5 rounded-2xl p-5 shadow-lg mb-4 hover:border-blue-500/20 transition-all";
 const labelText = "text-[9px] font-bold uppercase tracking-widest text-slate-500";
 return (
<div className="flex min-h-screen bg-[#0a1628] text-slate-200 font-sans text-sm">
<CustSidebar />
<div className="flex-1 flex flex-col">
<CustNavbar />
<main className="p-6 max-w-4xl mx-auto w-full">
         {/* Header Section - More Compact */}
<header className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
<div>
<h1 className="text-4xl font-extrabold text-white tracking-tight uppercase flex items-center gap-3 font-sans">
  <MessageSquare className="text-blue-500" size={32} /> Support History
</h1>
<p className={labelText}>Inquiry Archives</p>
</div>
<button
             onClick={fetchHistory}
             className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all"
>
<RefreshCw size={12} className={loading ? "animate-spin" : ""} />
             Refresh
</button>
</header>
         {/* Debug Strip - Smaller footprint */}
<div className="mb-6 bg-black/20 border border-white/5 rounded-xl p-3 text-[10px] grid grid-cols-2 md:grid-cols-4 gap-4">
<div><p className={labelText}>Email</p><code className="text-blue-400 truncate block">{debug.email || "N/A"}</code></div>
<div><p className={labelText}>Records</p><code className="text-slate-300">{history.length}</code></div>
<div><p className={labelText}>Last Sync</p><code className="text-slate-300">{debug.lastFetchedAt || "-"}</code></div>
<div className="flex items-center gap-2 text-slate-500">
<Info size={12}/> <span className="italic">Data active</span>
</div>
</div>
         {loading ? (
<div className="flex flex-col items-center py-12">
<Loader2 className="animate-spin text-blue-500 mb-2" size={28} />
<p className={labelText}>Fetching...</p>
</div>
         ) : history.length > 0 ? (
<div className="space-y-4">
             {history.map((item) => (
<div key={item._id} className={cardStyle}>
                 {/* Card Header */}
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-3">
<span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${
                       item.status === "Resolved"
                         ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                         : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                     }`}>
                       {item.status}
</span>
<h3 className="text-base font-bold text-white tracking-tight leading-none">
                       {item.subject}
</h3>
</div>
<div className="text-right">
<p className="text-slate-500 text-[9px] font-bold uppercase">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "-"}</p>
</div>
</div>
                 {/* Question Area */}
<div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-3 relative group">
<MessageSquare size={12} className="absolute -top-1.5 -left-1.5 text-slate-600 bg-[#0a1628] rounded-full p-0.5" />
<p className="text-slate-400 text-xs italic leading-snug">"{item.query}"</p>
</div>
                 {/* Reply Area */}
                 {item.reply?.trim() ? (
<div className="ml-4 border-l-2 border-blue-500/30 pl-4 py-1 mt-4">
<div className="flex items-center gap-2 mb-2">
<CheckCircle2 size={12} className="text-blue-400" />
<span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Underwriter Response</span>
</div>
<div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
<p className="text-slate-200 text-xs leading-relaxed">{item.reply}</p>
</div>
<p className="text-[8px] text-slate-600 mt-2 uppercase font-bold text-right">
                       Closed: {new Date(item.resolved_at || item.timestamp).toLocaleString()}
</p>
</div>
                 ) : (
<div className="flex items-center gap-2 text-slate-600 mt-2 pl-2">
<AlertCircle size={10} />
<p className="text-[9px] font-bold uppercase tracking-wider italic">Processing Inquiry...</p>
</div>
                 )}
</div>
             ))}
</div>
         ) : (
<div className="bg-[#111e32]/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
<HelpCircle className="mx-auto text-slate-700 mb-2" size={32} />
<p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No inquiries found</p>
</div>
         )}
</main>
</div>
</div>
 );
}
export default CustSupportHistory;
