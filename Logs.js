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
  Loader2, 
  MessageSquare,
  Send 
} from "lucide-react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // States for Decline Reason Modal
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  // 1. Fetching Logic: Only shows logs that haven't been processed yet
  const fetchLogs = () => {
    setLoading(true);
    API.get("/admin/logs")
      .then((res) => {
        // Filter out any logs that already have a status other than 'Pending'
        const pendingLogs = res.data.filter(log => !log.status || log.status === "Pending");
        setLogs(pendingLogs);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        toast.error("Failed to load fraud logs.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  /**
   * 2. Handle Admin Action
   * @param {Object} log - The log entry
   * @param {String} status - 'Approved' or 'Declined'
   * @param {String} reason - The manual reason for decline
   */
  const handleAction = async (log, status, reason = "") => {
    setProcessingId(log.Policy_id);

    const recipient = log.customer_id || log.cust_id || log.user_id;

    try {
      // --- STEP A: Update Status & Reason in DB ---
      await API.post(`/admin/logs/update-status`, { 
        Policy_id: log.Policy_id, 
        status: status,
        reason: reason // This field is saved in the fraud_logs collection
      });

      // --- STEP B: Send Notification to Customer ---
      if (recipient) {
        const notificationData = {
          recipient_id: String(recipient),
          message: status === "Approved" 
            ? `Your claim for ${log.Policy_id} was APPROVED. View your policy details.` 
            : `Your claim for ${log.Policy_id} was declined. Click to see the reason.`,
          link: "/customer/claim-policies", // Redirects to the page with the "Know More" button
          status: status
        };

        await API.post("/notifications/add", notificationData);
      }

      toast.success(`Claim ${status} successfully.`);
      
      // Cleanup Modal states
      setShowDeclineModal(false);
      setDeclineReason("");
      setSelectedLog(null);

      // Refresh list: The item will disappear because its status is no longer 'Pending'
      fetchLogs(); 
    } catch (err) {
      console.error("Process Error:", err);
      toast.error("Error updating claim status.");
    } finally {
      setProcessingId(null);
    }
  };

  const openDeclineModal = (log) => {
    setSelectedLog(log);
    setShowDeclineModal(true);
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div className="text-left">
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
          <p className="font-mono text-gray-600 uppercase tracking-widest text-sm italic">Clean_Queue: No_Pending_Requests</p>
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

                  <td className="p-5 text-xs text-gray-400 italic leading-relaxed max-w-xs text-left">
                    <div className="flex items-start gap-3">
                      <Info size={14} className="shrink-0 mt-0.5 text-blue-500/50" />
                      <span>{log.reasons || "Probability threshold exceeded."}</span>
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
                        onClick={() => openDeclineModal(log)}
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

      {/* --- DECLINE REASON MODAL --- */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111e32] border border-white/10 w-full max-w-md rounded-3xl p-8 animate-in zoom-in duration-200 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <MessageSquare className="text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Decline Reason</h3>
            </div>

            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest text-left">Internal Policy Note</p>
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-red-500 h-32 resize-none mb-6 text-sm"
              placeholder="Provide a reason for declining this claim (e.g., Missing police report, suspicious image variance...)"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeclineModal(false)} 
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAction(selectedLog, "Declined", declineReason)} 
                disabled={!declineReason || processingId === selectedLog?.Policy_id}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {processingId === selectedLog?.Policy_id ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Logs;
