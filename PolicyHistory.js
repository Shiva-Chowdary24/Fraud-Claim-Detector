import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { History, FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";

function CustPolicyHistory() {
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

  const filteredData = history.filter(item => 
    filter === "All" ? true : item.status === filter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "Settled": return <CheckCircle size={14} className="text-emerald-500" />;
      case "Rejected": return <XCircle size={14} className="text-red-500" />;
      case "Pending": return <Clock size={14} className="text-amber-500" />;
      default: return null;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Settled": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected": return "bg-red-50 text-red-700 border-red-100";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <CustSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header and Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#0a1628] flex items-center gap-3">
                  <History className="text-blue-600" size={32} /> Policy History
                </h1>
                <p className="text-gray-500 text-sm mt-1">Archive of your settled and processed insurance claims.</p>
              </div>

              <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                {["All", "Settled", "Rejected", "Pending"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                      filter === tab 
                        ? "bg-[#0a1628] text-white shadow-md" 
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white animate-pulse rounded-xl border border-gray-100"></div>)}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm">
                <FileText size={50} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">No policy records found for "{filter}"</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-5 font-bold text-[#0a1628] text-xs uppercase tracking-wider">Policy Detail</th>
                      <th className="p-5 font-bold text-[#0a1628] text-xs uppercase tracking-wider">Claim Amount</th>
                      <th className="p-5 font-bold text-[#0a1628] text-xs uppercase tracking-wider">Status</th>
                      <th className="p-5 font-bold text-[#0a1628] text-xs uppercase tracking-wider">Closed Date</th>
                      <th className="p-5 font-bold text-[#0a1628] text-xs uppercase tracking-wider text-right">Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="p-5">
                          <div className="font-bold text-gray-800">{item.Policy_id}</div>
                          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">{item.plan_name || "Auto Protection"}</div>
                        </td>
                        <td className="p-5">
                          <span className="font-bold text-gray-700">${item.claim_amount?.toLocaleString()}</span>
                        </td>
                        <td className="p-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="p-5 text-sm text-gray-500 font-medium">
                          {new Date(item.updated_at || item.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-5 text-right">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
