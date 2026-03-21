import { useEffect, useState } from "react";
import axios from "axios";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import { History, Shield, Clock, CheckCircle, XCircle } from "lucide-react";

function CustPolicyHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const customerId = localStorage.getItem("customer_id");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/customer/full-history?customer_id=${customerId}`);
        setHistory(res.data);
      } catch (err) {
        toast.error("Error loading history.");
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchHistory();
  }, [customerId]);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
              <History className="text-blue-500" /> Policy History
            </h1>

            {loading ? (
              <p>Loading...</p>
            ) : history.length === 0 ? (
              <div className="p-20 text-center border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500">No records found for ID #{customerId}</p>
              </div>
            ) : (
              <div className="bg-[#111e32] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="p-5 text-xs uppercase text-slate-400">Policy</th>
                      <th className="p-5 text-xs uppercase text-slate-400">Date</th>
                      <th className="p-5 text-xs uppercase text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-5">
                          <div className="font-bold">{item.plan_name}</div>
                          <div className="text-xs text-blue-400 font-mono">#{item.request_id || item.policy_id}</div>
                        </td>
                        <td className="p-5 text-sm text-slate-300">
                          {new Date(item.submitted_at || item.issued_date).toLocaleDateString()}
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2 w-fit ${
                            item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            item.status === 'Declined' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {item.status === 'Active' ? <CheckCircle size={12}/> : item.status === 'Declined' ? <XCircle size={12}/> : <Clock size={12}/>}
                            {item.status.toUpperCase()}
                          </span>
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
