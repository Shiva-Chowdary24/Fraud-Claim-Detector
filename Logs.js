import { useEffect, useState } from "react";
import API from "../services/api"; // ✅ Using your centralized API instance
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { 
  Check, 
  X, 
  ShieldAlert, 
  Info, 
  RefreshCw, 
  Loader2, 
  ExternalLink 
} from "lucide-react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // 1. Fetching Logic: Pulls Class 01 (Suspicious) logs from FastAPI
  const fetchLogs = () => {
    setLoading(true);
    API.get("/admin/logs")
      .then((res) => {
        setLogs(res.data);
        console.log("Fetched Fraud Logs:", res.data);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        toast.error("Failed to load fraud logs from database.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  /**
   * 2. Handle Admin Action (Approve/Decline)
   * Step A: Updates the status in the 'fraud_logs' collection.
   * Step B: Automatically sends a notification to the specific Customer ID.
   */
  const handleAction = async (log, status) => {
    setProcessingId(log.Policy_id);

    // ✅ DETECT RECIPIENT ID
    // We try every possible field name to ensure we don't send 'undefined' to Mongo
    const recipient = log.customer_id || log.cust_id || log.user_id || log.userId;

    console.log(`Action Triggered: ${status} for ${log.Policy_id}`);
    console.log("Recipient Detection:", { 
      foundID: recipient, 
      fullLogData: log 
    });

    try {
      // --- STEP A: Update Status in Backend ---
      // This matches your @router.post("/admin/logs/update-status")
      await API.post(`/admin/logs/update-status`, { 
        Policy_id: log.Policy_id, 
        status: status 
      });

      // --- STEP B: Send Notification to Customer ---
      // This matches your @app.post("/notifications/add")
      if (recipient) {
        const notificationData = {
          recipient_id: String(recipient), // Must be a string for the fetcher
          message: status === "Approved" 
            ? `Good news! Your claim for ${log.Policy_id} was APPROVED. Click to predict your payout.` 
            : `Notice: Your claim for ${log.Policy_id} was declined following a risk review.`,
          link: status === "Approved" ? "/customer/predict-claim" : "/customer/dashboard",
          status: status
        };

        await API.post("/notifications/add", notificationData);
        console.log("Notification sent successfully to:", recipient);
      } else {
        console.warn("Notification skipped: No customer_id found in this log entry.");
        toast.warning("Status updated, but could not notify user (ID missing).");
      }

      toast.success(`Policy ${log.Policy_id} marked as ${status}`);
      
      // Refresh list to remove the processed item
      fetchLogs(); 
    } catch (err) {
      console.error("Process Error:", err.response?.data || err.message);
      toast.error("Server error during processing.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-white text-left">
            <ShieldAlert size={28} className="text-red-500" /> Fraud Review Queue
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1 text-left">
            Manual verification required for AI Class_01 flags
          </p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="group text-xs border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all flex items-center gap-2 font-bold text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
          SYNC_DATABASE
        </button>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={32} />
          <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">Scanning_Database...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
          <p className="font-mono text-gray-600 uppercase tracking-widest text-sm italic">Clean_Queue: No_Suspicious_Activity</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 bg-black/20 rounded-3xl shadow-2xl overflow-hidden">
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
                <tr key={log.Policy_id} className="hover:bg-white/5 transition-colors">
                  <td className="p-5 font-mono text-sm text-blue-400 font-bold">
                    {log.Policy_id}
                  </td>
                  
                  <td className="p-5 text-center font-mono text-xs text-slate-500">
                    {log.customer_id || log.cust_id || "MISSING"}
                  </td>

                  <td className="p-5 text-xs text-gray-400 italic leading-relaxed max-w-xs">
                    <div className="flex items-start gap-3">
                      <Info size={14} className="shrink-0 mt-0.5 text-blue-500/50" />
                      <span>{log.reasons || "Probability threshold exceeded. Manual audit required."}</span>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex flex-col gap-2 w-full max-w-[140px] mx-auto">
                      <button
                        disabled={processingId === log.Policy_id}
                        onClick={() => handleAction(log, "Approved")}
                        className="flex items-center justify-center gap-2 border border-emerald-500/50 text-emerald-500 py-2 text-[9px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-30 rounded-lg"
                      >
                        {processingId === log.Policy_id ? <Loader2 className="animate-spin" size={10}/> : <Check size={12} />} 
                        APPROVE
                      </button>
                      
                      <button
                        disabled={processingId === log.Policy_id}
                        onClick={() => handleAction(log, "Declined")}
                        className="flex items-center justify-center gap-2 border border-red-500/50 text-red-500 py-2 text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 rounded-lg"
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
