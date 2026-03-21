import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import { ShieldCheck, Clock, ChevronDown, ChevronUp, CreditCard, Info } from "lucide-react";

function CustIssuedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Retrieve auth data from localStorage
  const customerId = localStorage.getItem("customer_id");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        
        // Debugging logs - check these in F12 console
        console.log("Fetching policies for ID:", customerId);
        console.log("User Role being sent:", userRole);

        // ✅ URL must match your @router.get in customer.py
        const res = await API.get(`/customer/issued-policies`, {
          params: { customer_id: customerId }, // Sends as ?customer_id=...
          headers: { 
            "role": userRole // Sends security header
          }
        });
        
        console.log("Response from server:", res.data);
        setPolicies(res.data);
      } catch (err) {
        console.error("Fetch Error Details:", err.response || err);
        
        if (err.response?.status === 403) {
          toast.error("Security access denied. Please re-login.");
        } else {
          toast.error("Failed to load policies. Server might be down.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (customerId && userRole) {
      fetchPolicies();
    } else {
      setLoading(false);
      console.warn("Missing credentials in localStorage");
    }
  }, [customerId, userRole]);

  const handlePayment = (policyId, amount) => {
    toast.info(`Redirecting to payment gateway for $${amount}...`);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="mb-10 text-left">
            <h1 className="text-4xl font-black text-white tracking-tight">My Issued Policies</h1>
            <p className="text-slate-400 text-sm mt-2">View your active protection and manage installments.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : !policies || policies.length === 0 ? (
            <div className="bg-[#111e32]/50 border border-dashed border-slate-800 rounded-[2.5rem] p-20 text-center shadow-2xl">
              <ShieldCheck size={56} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-400 font-medium tracking-tight text-lg">No active policies found.</p>
              <p className="text-slate-600 text-sm mt-1">Once your application is approved, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              {policies.map((policy) => (
                <div key={policy._id || policy.policy_id} className="bg-[#111e32]/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden transition-all hover:border-blue-500/30">
                  
                  {/* Card Header */}
                  <div className="bg-[#1a2c46] p-6 flex justify-between items-center border-b border-slate-800">
                    <div className="text-left">
                      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.2em]">Policy Number</p>
                      <h3 className="text-xl font-black text-blue-400 tracking-tighter">{policy.policy_id}</h3>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest">
                      Active
                    </div>
                  </div>

                  {/* Main Summary */}
                  <div className="p-8 space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Plan</span>
                        <span className="text-white font-bold">{policy.plan_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tenure</span>
                        <span className="text-white font-bold">{policy.tenure} Years</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Premium Status</span>
                        <span className="text-orange-400 font-bold text-xs flex items-center gap-1">
                          <Clock size={12} /> Installment Pending
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => toggleExpand(policy.policy_id)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all border border-slate-700"
                      >
                        {expandedId === policy.policy_id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        {expandedId === policy.policy_id ? "Hide Details" : "Know More"}
                      </button>
                    </div>

                    {expandedId === policy.policy_id && (
                      <div className="mt-4 p-6 bg-black/30 rounded-3xl border border-slate-800/50 space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-start gap-3">
                          <Info size={16} className="text-blue-500 mt-1 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Coverage Info</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Annual Premium: <strong>${policy.premium_amount || policy.premium}</strong>. <br/>
                              Approved on: {policy.approved_at ? new Date(policy.approved_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handlePayment(policy.policy_id, policy.premium_amount || policy.premium)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                        >
                          <CreditCard size={18} /> Pay Premium (${policy.premium_amount || policy.premium})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CustIssuedPolicies;
