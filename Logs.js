import { useEffect, useState } from "react";
import API from "../api";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { Check, X, ShieldAlert, Clock, Info } from "lucide-react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    API.get("/admin/logs")
      .then((res) => setLogs(res.data))
      .catch((err) => toast.error("Failed to load logs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleAction = async (policyId, status) => {
    try {
      await API.post(`/admin/logs/update-status`, { Policy_id: policyId, status: status });
      toast.success(`Request ${status} successfully`);
      fetchLogs();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8 border-b border-white pb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter flex items-center gap-2">
          <ShieldAlert size={24} /> Fraud Detection Logs
        </h2>
        <button onClick={fetchLogs} className="text-xs border border-white px-3 py-1 hover:bg-white hover:text-black">
          REFRESH_DATA
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse font-mono">SCANNING_DATABASE...</p>
      ) : logs.length === 0 ? (
        <p className="font-mono text-gray-500">NO_FRAUD_DETECTED</p>
      ) : (
        <div className="overflow-x-auto border border-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-black text-xs uppercase font-black">
                <th className="p-4 border-r border-black">ID</th>
                <th className="p-4 border-r border-black">Risk %</th>
                <th className="p-4 border-r border-black">Reasoning</th>
                <th className="p-4 border-r border-black"><Clock size={14} /></th>
                <th className="p-4 text-center">Decisions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t border-white hover:bg-gray-800 transition-colors">
                  <td className="p-4 font-mono text-sm border-r border-white">{log.Policy_id}</td>
                  <td className="p-4 border-r border-white font-black">
                    <span className={log.probability > 0.7 ? "text-red-500" : "text-green-500"}>
                      {log.probability ? `${(log.probability * 100).toFixed(0)}%` : "-"}
                    </span>
                  </td>
                  <td className="p-4 border-r border-white text-sm text-gray-300 italic">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="shrink-0 mt-1" />
                      {log.reasons}
                    </div>
                  </td>
                  <td className="p-4 border-r border-white text-[10px] leading-tight font-mono">
                    {new Date(log.timestamp).toLocaleDateString()}<br/>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAction(log.Policy_id, "Approved")}
                        className="flex items-center justify-center gap-2 border border-green-500 text-green-500 py-1 text-[10px] font-bold uppercase hover:bg-green-500 hover:text-black transition-all"
                      >
                        <Check size={12} /> APPROVE
                      </button>
                      <button
                        onClick={() => handleAction(log.Policy_id, "Declined")}
                        className="flex items-center justify-center gap-2 border border-red-500 text-red-500 py-1 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
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
