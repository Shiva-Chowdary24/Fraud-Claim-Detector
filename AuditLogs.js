import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/admin/audit-logs")
      .then((res) => {
        // Support multiple API response shapes
        if (Array.isArray(res.data)) {
          setLogs(res.data);
        } else if (Array.isArray(res.data?.data)) {
          setLogs(res.data.data);
        } else {
          setLogs([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load audit logs", err);
        setLogs([]);
      });
  }, []);

  /**
   * ✅ SAFELY normalize fields before searching
   * - Prevents "Objects are not valid as a React child"
   */
  const filteredLogs = logs.filter((log) => {
    const action =
      typeof log.action === "string"
        ? log.action
        : JSON.stringify(log.action || "");

    const details =
      typeof log.details === "string"
        ? log.details
        : JSON.stringify(log.details || "");

    return (
      action.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen bg-slate-900 text-slate-100">
        <h2 className="text-2xl font-bold mb-4 text-white">
          System Activity Log
        </h2>

        <input
          type="text"
          placeholder="Search by action or details..."
          className="w-full p-2 border border-slate-700 bg-slate-800 text-slate-100 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="p-4 text-slate-300 font-semibold uppercase text-xs">
                  Timestamp
                </th>
                <th className="p-4 text-slate-300 font-semibold uppercase text-xs">
                  Action
                </th>
                <th className="p-4 text-slate-300 font-semibold uppercase text-xs">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr
                    key={log.id || log.timestamp || index}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="p-4 text-sm text-slate-400">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-900/40 text-blue-400 border border-blue-800 rounded text-xs font-medium">
                        {typeof log.action === "string"
                          ? log.action
                          : JSON.stringify(log.action)}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300 text-sm whitespace-pre-wrap">
                      {typeof log.details === "string"
                        ? log.details
                        : JSON.stringify(log.details, null, 2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="p-10 text-center text-slate-500 italic"
                  >
                    No activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AuditLogs;
