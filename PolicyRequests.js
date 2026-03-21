import { useEffect, useState } from "react";
import API from "../services/api"; 
import AdminLayout from "../components/AdminLayout";
import { CheckCircle, XCircle, User, Activity, Wallet, Clock, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

function PolicyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch pending requests from the backend
  const fetchRequests = async () => {
    try {
      const res = await API.get("/admin/policy-requests");
      // Ensure we only show 'Pending' requests
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to load requests from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Approve: Generates PL-XXX-0000 and moves data to Issued Policies
  const handleApprove = async (id) => {
    try {
      const res = await API.post(`/admin/policy-approve/${id}`);
      toast.success(`Approved! Policy ID: ${res.data.policy_id}`);
      // Remove from the UI list immediately
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error("Could not complete approval");
    }
  };

  // 3. Decline: Rejects the application
  const handleDecline = async (id) => {
    try {
      await API.post(`/admin/policy-decline/${id}`);
      toast.warn("Application Declined");
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={32} /> 
            Policy Approval Requests
          </h2>
          <p className="text-slate-400 mt-2">Underwrite and verify customer insurance applications.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#111e32]/40 border border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
            <Clock className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-medium italic">No new applications to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((req) => (
              <div key={req._id} className="bg-[#111e32]/80 backdrop-blur-md border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-slate-700">
                
                {/* Main Info Section */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* User Profile */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <User size={14} className="text-blue-400" /> Applicant Details
                    </div>
                    <p className="text-white font-bold text-xl">{req.full_name}</p>
                    <p className="text-slate-500 text-xs truncate">{req.email}</p>
                    <div className="inline-block px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-bold uppercase">
                      ID: {req.identity_number || "N/A"}
                    </div>
                  </div>

                  {/* Financial & Risk Data */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Wallet size={14} className="text-emerald-400" /> Income & Job
                    </div>
                    <p className="text-white font-bold text-lg">
                      ${Number(req.annual_income).toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-sm">{req.occupation}</p>
                  </div>

                  {/* Medical Disclosure */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Activity size={14} className="text-red-400" /> Health History
                    </div>
                    <p className="text-slate-300 text-sm italic line-clamp-3 bg-black/20 p-3 rounded-xl border border-slate-800/50">
                      "{req.medical_history || "No disclosures"}"
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="lg:col-span-3 flex flex-col justify-center gap-3">
                    <div className="mb-2 text-right">
                      <p className="text-blue-400 font-bold text-sm">{req.plan_name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        Term: {req.tenure} Years
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(req._id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-emerald-900/20"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleDecline(req._id)}
                        className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl transition-all"
                        title="Decline"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Status Bar */}
                <div className="bg-slate-900/40 px-8 py-3 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                   <span>Request ID: {req.request_id || "NEW"}</span>
                   <span className="flex items-center gap-2 italic font-normal normal-case">
                     Nominee: <span className="text-slate-300">{req.nominee_name}</span> ({req.nominee_relation})
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default PolicyRequests;
