import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { MessageCircle, User, Clock, Send, ShieldCheck,Loader2 } from "lucide-react";
import { toast } from "react-toastify";
function CustomerQueries() {
 const [queries, setQueries] = useState([]);
 const [loading, setLoading] = useState(true);
 const [replies, setReplies] = useState({}); // Stores reply for each specific ID
 const fetchQueries = async () => {
   try {
     const res = await API.get("/admin/queries", {
       headers: { role: "admin" }
     });
     setQueries(res.data);
   } catch (err) {
     toast.error("Access Denied or Server Error");
   } finally {
     setLoading(false);
   }
 };
 useEffect(() => {
   fetchQueries();
 }, []);
 const handleReplyChange = (id, text) => {
   setReplies(prev => ({ ...prev, [id]: text }));
 };
 const sendReply = async (id) => {
   const text = replies[id];
   if (!text) return toast.warn("Reply cannot be empty");
   try {
     await API.post(`/admin/reply/${id}`, { reply: text });
     toast.success("Response dispatched to customer");
     // Remove query from list after replying
     setQueries(prev => prev.filter(q => q._id !== id));
   } catch (err) {
     toast.error("Failed to send reply");
   }
 };
 const inputStyle = "w-full bg-[#0a0f1a] border border-slate-800 p-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner";
 return (
<AdminLayout>
<div className="p-8 max-w-6xl mx-auto text-left">
<header className="mb-12">
<h2 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-3">
<ShieldCheck className="text-blue-500" size={36} /> Customer Inquiries
</h2>
<p className="text-slate-500 text-xs tracking-[0.2em] mt-2 uppercase">Management Portal for Support Tickets</p>
</header>
       {loading ? (
<div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40}/></div>
       ) : queries.length === 0 ? (
<div className="bg-[#111e32]/40 border border-dashed border-slate-800 rounded-[3rem] p-20 text-center">
<MessageCircle className="mx-auto text-slate-800 mb-4" size={50} />
<p className="text-slate-600 font-bold uppercase tracking-widest">Inbox Zero: No pending queries</p>
</div>
       ) : (
<div className="space-y-8">
           {queries.map((q) => (
<div key={q._id} className="bg-[#111e32]/60 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-2xl transition-all hover:border-blue-500/20 group">
<div className="flex justify-between items-start mb-6">
<div className="flex items-center gap-4">
<div className="bg-blue-600/10 p-3 rounded-2xl"><User className="text-blue-400" size={20}/></div>
<div>
<p className="text-white font-black uppercase text-lg tracking-tight">{q.user_name}</p>
<p className="text-slate-500 text-xs">{q.email}</p>
</div>
</div>
<div className="flex items-center gap-2 text-slate-600 bg-black/20 px-4 py-2 rounded-full border border-white/5">
<Clock size={14} />
<span className="text-[10px] font-bold uppercase tracking-tighter">{new Date(q.timestamp).toLocaleDateString()}</span>
</div>
</div>
<div className="mb-8">
<p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">{q.subject || "No Subject"}</p>
<p className="text-slate-300 text-sm leading-relaxed bg-black/20 p-5 rounded-2xl border border-white/5 italic">
                       "{q.query}"
</p>
</div>
<div className="space-y-4">
<textarea
                   placeholder="Type your professional response here..."
                   className={inputStyle + " h-32 resize-none"}
                   value={replies[q._id] || ""}
                   onChange={(e) => handleReplyChange(q._id, e.target.value)}
                 />
<button
                   onClick={() => sendReply(q._id)}
                   className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
>
<Send size={14} /> Send Official Reply
</button>
</div>
</div>
           ))}
</div>
       )}
</div>
</AdminLayout>
 );
}
export default CustomerQueries;
