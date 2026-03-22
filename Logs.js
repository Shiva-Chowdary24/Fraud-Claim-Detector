import { useEffect, useState } from "react";
import API from "../api";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { Check, X, ShieldAlert, Clock, Info, RefreshCw } from "lucide-react";

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

  const handleAction = async (log, status) => {
    try {
      // 1. Update the status in the main logs table
      await API.post(`/admin/logs/update-status`, { 
        Policy_id: log.Policy_id, 
        status: status 
      });

      // 2. Logic for specific Customer Notifications
      let notificationMessage = "";
      let path = "";

      if (status === "Approved") {
        notificationMessage = "Congratulations! Your claim was approved. Click here to predict the claimable amount.";
        path = "/customer/claim-status"; // Redirects to the prediction page
      } else {
        notificationMessage = "Your claim is suspected as fraud, so your claim was not approved.";
        path = "/customer/dashboard"; // Redirects back to dashboard
      }

      // 3. Send the notification to the backend
      await API.post("/notifications/add", {
        recipient_email: log.user_email || log.Policy_id, // Ensure your log data has user context
        message: notificationMessage,
        link: path,
        status: status // "Approved" or "Declined"
      });

      toast.success(`Claim ${status} and user notified.`);
      fetchLogs();
    } catch (err) {
      toast.error("Failed to process decision.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8 border-b border-white pb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter flex items-center gap-2">
          <ShieldAlert size={24} /> Fraud Review Queue (Class 1)
        </h2>
        <button 
          onClick={fetchLogs} 
          className="group text-xs border border-white px-3 py-1 hover:bg-white hover:text-black transition-all flex items-center gap-2"
        >
          <RefreshCw size={12} className="group-active:rotate-180 transition-transform" /> 
          REFRESH_LOGS
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse font-mono uppercase text-xs tracking-widest">Scanning_Security_Breaches...</p>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-gray-800">
          <p className="font-mono text-gray-500 uppercase tracking-widest text-sm">No suspicious claims pending review</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-black text-[10px] uppercase font-black">
                <th className="p-4 border-r border-black">Policy ID</th>
                <th className="p-4 border-r border-black text-center font-bold">Risk Level</th>
                <th className="p-4 border-r border-black text-center">Reasoning Analysis</th>
                <th className="p-4 border-r border-black text-center"><Clock size={14} className="inline"/></th>
                <th className="p-4 text-center">Final Decision</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t border-white hover:bg-gray-900 transition-colors">
                  <td className="p-4 font-mono text-sm border-r border-white tracking-tighter">{log.Policy_id}</td>
                  
                  <td className="p-4 border-r border-white font-black text-center">
                    <span className="text-red-500">
                      {log.probability ? `${(log.probability * 100).toFixed(0)}%` : "HIGH"}
                    </span>
                  </td>

                  <td className="p-4 border-r border-white text-xs text-gray-300 italic">
                    <div className="flex items-start justify-center gap-2 max-w-md mx-auto text-center">
                      <Info size={12} className="shrink-0 mt-0.5 text-gray-500" />
                      <span>{log.reasons}</span>
                    </div>
                  </td>

                  <td className="p-4 border-r border-white text-[10px] leading-tight font-mono text-center">
                    <div className="flex flex-col items-center">
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="text-gray-500 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-2 max-w-[140px] mx-auto">
                      <button
                        onClick={() => handleAction(log, "Approved")}
                        className="flex items-center justify-center gap-2 border border-green-500 text-green-500 py-2 text-[9px] font-bold uppercase hover:bg-green-500 hover:text-black transition-all"
                      >
                        <Check size={12} /> APPROVE CLAIM
                      </button>
                      <button
                        onClick={() => handleAction(log, "Declined")}
                        className="flex items-center justify-center gap-2 border border-red-500 text-red-500 py-2 text-[9px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
                      >
                        <X size={12} /> DECLINE (FRAUD)
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
