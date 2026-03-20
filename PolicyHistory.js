import { useEffect, useState } from "react";
import API from "../services/api";
import CustLayout from "../components/CustLayout";
import { toast } from "react-toastify";
import { History, FileText, Download, Filter } from "lucide-react";

function PolicyHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/customer/policy-history");
        setHistory(res.data);
      } catch (err) {
        toast.error("Could not load history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filter logic
  const filteredData = history.filter(item => 
    filter === "All" ? true : item.status === filter
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Settled": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <CustLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0a1628] flex items-center gap-2">
              <History className="text-blue-600" /> Policy History
            </h1>
            <p className="text-gray-500">View records of your past claims and closed policies.</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {["All", "Settled", "Rejected", "Pending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
            <FileText size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No records found for "{filter}"</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Policy Details</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Claim Amount</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{item.Policy_id}</div>
                      <div className="text-xs text-gray-500">{item.plan_name || "Standard Plan"}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      ${item.claim_amount?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(item.updated_at || item.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Download Receipt">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CustLayout>
  );
}

export default PolicyHistory;
