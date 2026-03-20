import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import { History, FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";

function CustPolicyHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/customer/policy-history");
        setHistory(res.data);
      } catch (err) {
        toast.error("Could not load history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredData = history.filter(item => filter === "All" ? true : item.status === filter);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        <main className="p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3"><History className="text-blue-500" /> Policy History</h1>
                <p className="text-slate-400 text-sm mt-1">Archive of your settled insurance claims.</p>
              </div>
              <div className="flex bg-[#111e32] p-1 rounded-xl border border-slate-800">
                {["All", "Settled", "Rejected", "Pending"].map((tab) => (
                  <button key={tab} onClick={() => setFilter(tab)} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${filter === tab ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#111e32] animate-pulse rounded-xl border border-slate-800"></div>)}</div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-24 bg-[#111e32] rounded-3xl border border-slate-800 shadow-2xl">
                <FileText size={50} className="mx-auto text-slate-800 mb-4" />
                <p className="text-slate-500">No records found for "{filter}"</p>
              </div>
            ) : (
              <div className="bg-[#111e32] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a2c46] border-b border-slate-800">
                      <th className="p-5 font-bold text-slate-300 text-xs uppercase tracking-wider">Policy Detail</th>
                      <th className="p-5 font-bold text-slate-300 text-xs uppercase tracking-wider">Claim Amount</th>
                      <th className="p-5 font-bold text-slate-300 text-xs uppercase tracking-wider">Status</th>
                      <th className="p-5 font-bold text-slate-300 text-xs uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b border-slate-800/50 hover:bg-[#1a2c46]/50 transition-colors group">
                        <td className="p-5">
                          <div className="font-bold text-white">{item.Policy_id}</div>
                          <div className="text-[11px] text-slate-500 uppercase">{item.plan_name || "Standard Cover"}</div>
                        </td>
                        <td className="p-5 font-bold text-blue-400">${item.claim_amount?.toLocaleString()}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${item.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"><Download size={18} /></button>
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
