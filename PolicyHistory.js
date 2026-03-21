import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import { History, FileText, Download, CheckCircle, XCircle, Clock, Shield } from "lucide-react";

function CustPolicyHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // Get the unique ID from storage
  const customerId = localStorage.getItem("customer_id");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetching from the unified history endpoint
        const res = await API.get(`/customer/full-history?customer_id=${customerId}`);
        setHistory(res.data);
      } catch (err) {
        toast.error("Could not load history.");
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchHistory();
  }, [customerId]);

  // Adjusting filter logic to match your backend status strings
  const filteredData = history.filter(item => 
    filter === "All" ? true : item.status === filter
  );

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div>
                <h1 className="text-4xl font-black flex items-center gap-3 tracking-tight">
                  <History className="text-blue-500" size={36} /> Policy History
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  View all applications for ID: <span className="text-blue-400 font-mono">#{customerId}</span>
                </p>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex bg-[#111e32] p-1.5 rounded-2xl border border-slate-800 shadow-xl">
                {["All", "Active", "Declined", "Pending"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setFilter(tab)} 
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                      filter === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-[#111e32]/50 animate-pulse rounded-3xl border border-slate-800"></div>
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-32 bg-[#111e32]/30 rounded-[3rem] border border-dashed border-slate-800">
                <FileText size={60} className="mx-auto text-slate-800 mb-6" />
                <p className="text-slate-500 font-bold">No records found for "{filter}"</p>
              </div>
            ) : (
              <div className="bg-[#111e32]/80 backdrop-blur-md border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a2c46]/50 border-b border-slate-800">
                      <th className="p-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Policy Detail</th>
                      <th className="p-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Premium / Year</th>
                      <th className="p-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                      <th className="p-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item._id} className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-2xl ${
                               item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
                               item.status === 'Declined' ? 'bg-red-500/10 text-red-400' : 
                               'bg-amber-500/10 text-amber-400'
                             }`}>
                               <Shield size={20} />
                             </div>
                             <div>
                               <div className="font-black text-white text-base">{item.plan_name}</div>
                               <div className="text-[10px] text-slate-500 font-bold uppercase">
                                 Applied: {new Date(item.submitted_at || item.issued_date).toLocaleDateString()}
                               </div>
                             </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="font-black text-blue-400 text-lg">
                            ${item.premium_amount?.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase">{item.tenure} Years</div>
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black border ${
                            item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            item.status === 'Declined' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {item.status === 'Active' ? <CheckCircle size={12}/> : 
                             item.status === 'Declined' ? <XCircle size={12}/> : 
                             <Clock size={12}/>}
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="font-mono text-sm font-bold text-slate-400 group-hover:text-blue-400">
                             {item.policy_id || "REF-PENDING"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CustPolicyHistory;
