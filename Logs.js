import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import {
  Check,
  X,
  ShieldAlert,
  Info,
  RefreshCw,
  Loader2
} from "lucide-react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch fraud logs
  const fetchLogs = () => {
    setLoading(true);
    API.get("/admin/logs")
      .then((res) => {
        setLogs(res.data);
      })
      .catch(() => {
        toast.error("Failed to load fraud logs from database.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle approve / decline
  const handleAction = async (log, status) => {
    setProcessingId(log.Policy_id);

    const recipient =
      log.customer_id || log.cust_id || log.user_id || log.userId;

    try {
      await API.post("/admin/logs/update-status", {
        Policy_id: log.Policy_id,
        status: status
      });
      toast.success(`Policy ${log.Policy_id} marked as ${status}`);
      fetchLogs();
    } catch (err) {
      toast.error("Server error during processing.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
            <ShieldAlert size={28} className="text-red-500" />
            Fraud Review Queue
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">
            Manual verification
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="text-xs border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all flex items-center gap-2 font-bold text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={32} />
          <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">
            Scanning_Database...
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
          <p className="font-mono text-gray-600 uppercase tracking-widest text-sm italic">
            Clean_Queue: No_Suspicious_Activity
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 bg-black/20 rounded-3xl shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-white/10">
                <th className="p-5">Policy ID</th>
                <th className="p-5 text-center">Cust ID</th>
                <th className="p-5">Risk Analysis</th>
                <th className="p-5 text-center">Decision</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.Policy_id} className="hover:bg-white/5">
                  <td className="p-5 font-mono text-sm text-blue-400 font-bold">
                    {log.Policy_id}
                  </td>

                  <td className="p-5 text-center font-mono text-xs text-slate-500">
                    {log.customer_id || log.cust_id || "MISSING"}
                  </td>

                  <td className="p-5 text-xs text-gray-400 italic max-w-xs">
                    <div className="flex items-start gap-3">
                      <Info size={14} className="text-blue-500/50 mt-0.5" />
                      <span>
                        {log.reasons ||
                          "Probability threshold exceeded. Manual audit required."}
                      </span>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex flex-col gap-2 w-full max-w-[140px] mx-auto items-center">
                      {/* STATUS */}
                      {log.verified === false ? (
                        <span className="text-yellow-400 text-[9px] font-bold uppercase tracking-widest">
                          Pending
                        </span>
                      ) : (
                        <span className="text-green-400 text-[9px] font-bold uppercase tracking-widest">
                          Verified
                        </span>
                      )}

                      {/* APPROVE */}
                      <button
                        disabled={
                          processingId === log.Policy_id ||
                          log.verified === true
                        }
                        onClick={() => handleAction(log, "Approved")}
                        className="w-full flex items-center justify-center gap-2 border border-emerald-500/50 text-emerald-500 py-2 text-[9px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-30 rounded-lg"
                      >
                        <Check size={12} /> APPROVE
                      </button>

                      {/* DECLINE */}
                      <button
                        disabled={
                          processingId === log.Policy_id ||
                          log.verified === true
                        }
                        onClick={() => handleAction(log, "Declined")}
                        className="w-full flex items-center justify-center gap-2 border border-red-500/50 text-red-500 py-2 text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 rounded-lg"
                      >
                        <X size={12} /> DECLINE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

export default Logs;
