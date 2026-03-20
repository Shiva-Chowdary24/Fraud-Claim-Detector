import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { Check, X } from "lucide-react"; // Icons for buttons

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch logs on mount
  const fetchLogs = () => {
    setLoading(true);
    API.get("/admin/dealer/logs")
      .then((res) => {
        setLogs(res.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail || "Failed to load logs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle Approve / Decline
  const handleAction = async (policyId, status) => {
    try {
      // Replace with your actual status update endpoint
      await API.post(`/admin/logs/update-status`, {
        Policy_id: policyId,
        status: status, // "Approved" or "Declined"
      });
      
      toast.success(`Request ${status} successfully`);
      fetchLogs(); // Refresh list to show updated status
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl mb-6 font-bold">Fraud Logs & Approvals</h2>

      {loading ? (
        <p className="text-gray-500 italic">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No fraud logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">Policy ID</th>
                <th className="p-3 border-b">Probability</th>
                <th className="p-3 border-b w-1/3">Reasons</th>
                <th className="p-3 border-b">Timestamp</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-mono text-sm">{log.Policy_id}</td>

                  <td className="p-3">
                    <span className={`font-bold ${log.probability > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                      {log.probability != null
                        ? `${(log.probability * 100).toFixed(1)}%`
                        : "-"}
                    </span>
                  </td>

                  <td className="p-3 text-sm text-gray-700">{log.reasons}</td>

                  <td className="p-3">
                    {log.timestamp ? (
                      <>
                        <div className="font-medium text-xs">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleAction(log.Policy_id, "Approved")}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        title="Approve"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(log.Policy_id, "Declined")}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        title="Decline"
                      >
                        <X size={14} /> Decline
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
