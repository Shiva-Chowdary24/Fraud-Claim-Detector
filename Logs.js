import { useEffect, useState } from "react";
import API from "../api"; // Ensure this points to your axios instance
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { Check, X, ShieldAlert, Clock, Info, RefreshCw, Loader2 } from "lucide-react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // 1. Fetching logic from MongoDB
  const fetchLogs = () => {
    setLoading(true);
    API.get("/admin/logs")
      .then((res) => {
        // We only care about Class 1 (Suspicious) in this view
        setLogs(res.data);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        toast.error("Failed to load fraud logs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  /**
   * 2. Handle Admin Action (Approve/Decline)
   * This sends data to the Status Update endpoint AND the Notification endpoint
   */
  const handleAction = async (log, status) => {
    setProcessingId(log.Policy_id);
    try {
      // --- STEP A: Update Claim Status in DB ---
      // Sending as second argument ensures it goes in the Request BODY (Fixes 422)
      await API.post(`/admin/logs/update-status`, { 
        Policy_id: log.Policy_id, 
        status: status 
      });

      // --- STEP B: Define Notification Content ---
      let notificationMessage = "";
      let targetPath = "";

      if (status === "Approved") {
        notificationMessage = "Congratulations! Your claim was approved. Click here to predict the claimable amount.";
        targetPath = "/customer/predict-claim"; // The URL we defined for ClaimAmountPage.js
      } else {
        notificationMessage = "Your claim is suspected as fraud, so your claim was not approved.";
        targetPath = "/customer/dashboard";
      }

      // --- STEP C: Send Notification to DB ---
      await API.post("/notifications/add", {
        recipient_email: log.user_email || log.Policy_id,
        message: notificationMessage,
        link: targetPath,
        status: status
      });

      toast.success(`Claim ${status} and user notified successfully.`);
      fetchLogs(); // Refresh list to remove the processed item
    } catch (err) {
      console.error("Action Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.detail?.[0]?.msg || "Failed to process decision.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
            <ShieldAlert size={28} className="text-red-500" /> Fraud Review Queue
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">
            Manual verification required for AI Class_01 flags
          </p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="group text-xs border border-white px-4 py-2 hover:bg-white hover:text-black transition-all flex items-center gap-2 font-bold"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : "group-active:rotate-180 transition-transform"} /> 
          REFRESH_DATABASE
        </button>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="py-20 text-center">
          <p className="text-gray-500 animate-pulse font-mono uppercase text-xs tracking-[0.4em]">Initializing_Security_Scan...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-white/10 rounded-lg">
          <p className="font-mono text-gray-600 uppercase tracking-widest text-sm italic">Zero_Suspicious_Activity_Detected</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white bg-black/40 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-black text-[10px] uppercase font-black tracking-widest">
                <th className="p-5 border-r border-black">Policy Reference</th>
                <th className="p-5 border-r border-black text-center">Risk Score</th>
                <th className="p-5 border-r border-black">AI Reasoning Analysis</th>
                <th className="p-5 border-r border-black text-center">Timestamp</th>
                <th className="p-5 text-center">Final Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 font-mono text-sm border-r border-white/10 text-blue-400 font-bold">
                    {log.Policy_id}
                  </td>
                  
                  <td className="p-5 border-r border-white/10 text-center">
                    <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/50 rounded">
                      <span className="text-red-500 font-black text-sm">
                        {log.probability ? `${(log.probability * 100).toFixed(0)}%` : "HIGH"}
                      </span>
                    </div>
                  </td>

                  <td className="p-5 border-r border-white/10 text-xs text-gray-400 italic leading-relaxed">
                    <div className="flex items-start gap-3 max-w-md">
                      <Info size={14} className="shrink-0 mt-0.5 text-gray-600" />
                      <span>{log.reasons || "High variance in claim amount vs premium history detected."}</span>
                    </div>
                  </td>

                  <td className="p-5 border-r border-white/10 text-[10px] leading-tight font-mono text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-300">{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="font-bold opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex flex-col gap-2 w-full max-w-[160px] mx-auto">
                      <button
                        disabled={processingId === log.Policy_id}
                        onClick={() => handleAction(log, "Approved")}
                        className="flex items-center justify-center gap-2 border border-emerald-500 text-emerald-500 py-2.5 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processingId === log.Policy_id ? <Loader2 className="animate-spin" size={12}/> : <Check size={14} />} 
                        APPROVE_CLAIM
                      </button>
                      <button
                        disabled={processingId === log.Policy_id}
                        onClick={() => handleAction(log, "Declined")}
                        className="flex items-center justify-center gap-2 border border-red-500 text-red-500 py-2.5 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processingId === log.Policy_id ? <Loader2 className="animate-spin" size={12}/> : <X size={14} />} 
                        DECLINE_FRAUD
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
