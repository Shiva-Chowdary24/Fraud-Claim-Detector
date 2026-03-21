import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { ShieldCheck, CheckCircle2, X, ArrowRight, Info, Zap, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

function CustApplyPolicy() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  const navigate = useNavigate();

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // ✅ Get the role from localStorage
      const userRole = localStorage.getItem("role");

      // ✅ Pass the role in the headers, just like your Postman test
      const res = await API.get("/customer/available-policies", {
        headers: {
          "role": userRole
        }
      });

      if (Array.isArray(res.data)) {
        setPolicies(res.data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load policy catalog. Check security permissions.");
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
            <header className="mb-12 text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Available Policies</h1>
              <p className="text-slate-400 mt-2 text-sm">Explore our AI-verified insurance plans tailored for you.</p>
            </header>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
              </div>
            ) : policies.length === 0 ? (
              // ✅ Added empty state UI
              <div className="flex flex-col items-center justify-center py-20 bg-[#111e32]/40 rounded-[3rem] border border-dashed border-slate-800">
                <AlertCircle size={48} className="text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">No Plans Available</h3>
                <p className="text-slate-500 text-sm">The insurance catalog is currently empty. Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {policies.map((p) => (
                  <div key={p._id || p.id} className="bg-[#111e32]/60 backdrop-blur-md border border-slate-800 p-8 rounded-[2rem] shadow-2xl flex flex-col h-full hover:border-blue-500/50 transition-all group text-left">
                    <div className="bg-black w-14 h-14 flex items-center justify-center rounded-2xl border border-slate-700 mb-6">
                      <ShieldCheck className="text-blue-400" size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{p.plan_name}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {p.description || "Comprehensive insurance coverage tailored to your needs."}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-auto">
                      <span className="text-white font-black text-xl">${p.premium_amount}<span className="text-xs text-slate-500 font-normal">/yr</span></span>
                      <button 
                        onClick={() => setSelectedPolicy(p)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-xs shadow-lg"
                      >
                        Read More <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MEDIUM DIALOG / MODAL BOX --- */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-6">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[2rem] p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-6 right-6 p-1.5 bg-slate-800/50 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-500 transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-black w-12 h-12 flex items-center justify-center rounded-xl border border-slate-700">
                <ShieldCheck className="text-blue-400" size={24} />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-white leading-tight">{selectedPolicy.plan_name}</h2>
                <p className="text-emerald-400 font-bold text-sm">${selectedPolicy.premium_amount} / Year</p>
              </div>
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 text-left">
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Info size={12} className="text-blue-500" /> About Plan
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  {selectedPolicy.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={12} className="text-yellow-500" /> Key Benefits
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {(selectedPolicy.benefits || "Accidental Coverage, Theft Protection, Rapid Claims").split(",").map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                      <CheckCircle2 size={14} className="text-blue-500 shrink-0" /> 
                      <span>{benefit.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate("/customer/apply-form", { state: { policy: selectedPolicy } })}
              className="w-full bg-blue-600 mt-8 py-4 rounded-xl text-white font-bold text-base hover:bg-blue-500 transition-all shadow-lg active:scale-[0.98]"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustApplyPolicy;
