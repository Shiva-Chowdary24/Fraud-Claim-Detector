import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { ShieldCheck, CreditCard, ChevronDown, ChevronUp, User } from "lucide-react";
import { toast } from "react-toastify";

function CustIssuedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  
  // Get the 6-digit ID stored during Login/Signup
  const customerId = localStorage.getItem("customer_id"); 

  useEffect(() => {
    const fetchMyPolicies = async () => {
      try {
        // Fetch by Customer ID instead of just email for better security
        const res = await API.get(`/issued-policies?customer_id=${customerId}`);
        setPolicies(res.data);
      } catch (err) {
        toast.error("Could not load your policies.");
      }
    };
    if (customerId) fetchMyPolicies();
  }, [customerId]);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        <main className="flex-1 p-8 overflow-y-auto">
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Issued Policies</h1>
              <p className="text-slate-400 text-sm mt-2">Manage your active insurance protection plans.</p>
            </div>
            {/* Display the Unique Customer ID */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Customer ID</p>
              <p className="text-xl font-mono font-bold text-blue-400">#{customerId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {policies.map((p) => (
              <div key={p.policy_id} className="bg-[#111e32]/80 backdrop-blur-md rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                {/* Header with Policy ID */}
                <div className="bg-[#1a2c46] p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-black text-blue-400">{p.policy_id}</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 uppercase">Active</span>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-2 gap-y-6 mb-8">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Plan</p>
                      <p className="font-bold">{p.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tenure</p>
                      <p className="font-bold">{p.tenure} Years</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setExpandedId(expandedId === p.policy_id ? null : p.policy_id)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-4"
                  >
                    {expandedId === p.policy_id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    {expandedId === p.policy_id ? "Show Less" : "Know More"}
                  </button>

                  {expandedId === p.policy_id && (
                    <div className="mt-4 p-6 bg-black/20 rounded-2xl border border-slate-800 animate-in fade-in duration-300">
                       <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-medium">Policy Holder:</span>
                            <span className="text-white font-bold">{p.full_name}</span>
                          </div>
                          <button 
                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                          >
                            <CreditCard size={18} /> Pay First Installment (${p.premium_amount})
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CustIssuedPolicies;
