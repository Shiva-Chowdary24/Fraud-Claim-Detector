import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/dealer/logs")
      .then((res) => {
        setLogs(res.data);
        toast.success("Logs loaded successfully");
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail || "Failed to load logs");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl mb-6 font-bold">Fraud Logs</h2>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No fraud logs found.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Policy ID</th>
              <th className="p-2">Probability</th>
              <th className="p-2">Reasons</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t">
  <td className="p-2">{log.Policy_id}</td>

  {/* Probability → percentage with 1 decimal */}
  <td className="p-2">
    {log.probability != null
      ? `${(log.probability * 100).toFixed(1)}%`
      : "-"}
  </td>

  <td className="p-2">{log.reasons}</td>

  {/* Timestamp → date on top, time below */}
  <td className="p-2">
    {log.timestamp ? (
      <>
        <div className="font-medium">
          {new Date(log.timestamp).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-500">
          {new Date(log.timestamp).toLocaleTimeString()}
        </div>
      </>
    ) : (
      "-"
    )}
  </td>
</tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

export default Logs;
