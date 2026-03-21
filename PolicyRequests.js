import { useEffect, useState } from "react";
import API from "../services/api"; // Using your API helper
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import { CheckCircle, XCircle, User, Activity, Wallet, ShieldInfo, Clock } from "lucide-react";
import { toast } from "react-toastify";

function PolicyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch from backend
  const fetchRequests = async () => {
    try {
      const res = await API.get("/admin/policy-requests");
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Approve Logic (This triggers the PL-XXX-0000 generation in backend)
  const handleApprove = async (id) => {
    try {
      await API.post(`/admin/policy-approve/${id}`);
      toast.success("Policy Approved & ID Generated!");
      // Remove from list after approval
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  // 3. Decline Logic
  const handleDecline = async (id) => {
    try {
      await API.post(`/admin/policy-decline/${id}`);
      toast.warn("Application Declined");
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error("Decline action failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-slate-200">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <ShieldInfo className="text-blue-500" /> Policy Approval Requests
              </h2>
              <p className="text-slate-400 mt-2">Review customer applications and risk disclosures.</p>
            </header>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-[#111e32]/50 border border-dashed border-slate-700 rounded-3xl p-20 text-center">
                <Clock className="mx-auto text-slate-600 mb-4" size={48} />
                <p className="text-slate-500 font-medium">No pending applications at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {requests.map((req) => (
                  <div key={req._id} className="bg-[#111e32]/80 backdrop-blur-md border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:border-slate-700">
                    
                    {/* Top Row: User & Policy Info */}
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                      
                      {/* Column 1: Applicant */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                            <User size={18} />
                          </div>
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Applicant</h4>
                        </div>
                        <p className="text-white font-bold text-lg">{req.full_name}</p>
                        <p className="text-slate-500 text-xs italic">{req.email}</p>
                      </div>

                      {/* Column 2: Financials */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                            <Wallet size={18} />
                          </div>
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financial Risk</h4>
                        </div>
                        <p className="text-white font-bold">${req.annual_income?.toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">Income</span></p>
                        <p className="text-slate-400 text-sm">{req.occupation}</p>
                      </div>

                      {/* Column 3: Medical History */}
                      <div className="space-y-3 lg:col-span-1">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-500/10 p-2 rounded-lg text-red-400">
                            <Activity size={18} />
                          </div>
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Medical History</h4>
                        </div>
                        <p className="text-slate-300 text-sm line-clamp-2 italic">
                          "{req.medical_history || "No history provided"}"
                        </p>
                      </div>

                      {/* Column 4: Policy Details & Actions */}
                      <div className="bg-black/30 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
                        <div>
                          <p className="text-blue-400 font-bold text-sm">{req.plan_name}</p>
                          <p className="text-xs text-slate-500">Requested for {req.tenure} years</p>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                          <button 
                            onClick={() => handleApprove(req._id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-emerald-900/20"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button 
                            onClick={() => handleDecline(req._id)}
                            className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold"
                          >
                            <XCircle size={16} /> Decline
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Footer: Meta Info */}
                    <div className="bg-slate-900/50 px-8 py-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                       <span>Request ID: {req.request_id || "TEMP"}</span>
                       <span>Nominee: {req.nominee_name} ({req.nominee_relation})</span>
                       <span>Applied: {new Date(req.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PolicyRequests;
