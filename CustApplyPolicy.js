import { useState, useEffect } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { ShieldCheck, CheckCircle2, X, ArrowRight, Info, Zap } from "lucide-react";
import { toast } from "react-toastify";

function CustApplyPolicy() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null); // State for the Dialog Box

  const fetchPolicies = async () => {
    try {
      const res = await API.get("/customer/available-policies");
      if (Array.isArray(res.data)) {
        setPolicies(res.data);
      }
    } catch (err) {
      toast.error("Failed to load policy catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-slate-200">
      <CustSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Available Policies</h1>
              <p className="text-slate-400 mt-2">Explore our AI-verified insurance plans tailored for you.</p>
            </header>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {policies.map((p) => (
                  <div key={p.id} className="bg-[#111e32]/60 backdrop-blur-md border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col h-full hover:border-blue-500/50 transition-all group">
                    <div className="bg-black w-14 h-14 flex items-center justify-center rounded-2xl border border-slate-700 mb-6 shadow-inner">
                      <ShieldCheck className="text-blue-400" size={28} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{p.plan_name}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">{p.description}</p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-auto">
                      <span className="text-white font-black text-2xl">${p.premium_amount}<span className="text-xs text-slate-500 font-normal">/yr</span></span>
                      
                      <button 
                        onClick={() => setSelectedPolicy(p)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-900/20"
                      >
                        Read More <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- DIALOG / MODAL BOX --- */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex justify-center items-center p-4">
          {/* Dialog Container */}
          <div className="bg-[#0a1628] border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* CROSS MARK TO CLOSE */}
            <button 
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-8 right-8 p-2 bg-black/40 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-500 transition-all border border-slate-800"
            >
              <X size={24} />
            </button>

            {/* Icon Header */}
            <div className="bg-black w-20 h-20 flex items-center justify-center rounded-3xl border border-slate-700 mb-8 shadow-inner">
              <ShieldCheck className="text-blue-400" size={40} />
            </div>

            {/* Policy Title & Price */}
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{selectedPolicy.plan_name}</h2>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-2xl mb-8">
              ${selectedPolicy.premium_amount} <span className="text-slate-500 text-sm font-medium">Annual Premium</span>
            </div>
            
            <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Description Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-blue-500" />
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Full Description</h4>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
                  {selectedPolicy.description}
                </p>
              </div>

              {/* Benefits Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-yellow-500" />
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Policy Benefits</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPolicy.benefits?.split(",").map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0" /> 
                      <span className="font-medium">{benefit.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <button 
              className="w-full bg-blue-600 mt-10 py-5 rounded-[1.5rem] text-white font-bold text-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 active:scale-[0.98]"
            >
              Confirm & Apply Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustApplyPolicy;
