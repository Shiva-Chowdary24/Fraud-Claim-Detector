import { useState, useEffect } from "react";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { ShieldCheck, ArrowRight, Info, X, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

function CustApplyPolicy() {
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null); // For "Read More" Modal

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await API.get("/customer/available-policies");
        setAvailablePolicies(res.data);
      } catch (err) {
        toast.error("Failed to load available policies");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white font-sans">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        <main className="p-8 overflow-y-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white">Apply Policy</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Explore and enroll in premium protection plans.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
          ) : (
            <div className="space-y-4">
              {availablePolicies.map((p) => (
                <div key={p.id} className="bg-[#111e32] border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Policy Main Info */}
                  <div className="flex items-center gap-6 flex-1">
                    <div className="bg-black p-3 rounded-xl hidden md:block">
                      <ShieldCheck className="text-blue-400" size={24} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Policy Name</p>
                        <h3 className="text-lg font-bold text-white">{p.plan_name}</h3>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Tenure</p>
                        <h3 className="text-lg font-bold text-blue-400">{p.tenure} Years</h3>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Annual Premium</p>
                        <h3 className="text-lg font-bold text-emerald-400">${p.premium_amount}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedPolicy(p)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm px-4 py-2 transition-colors"
                    >
                      <Info size={18} /> Read More
                    </button>
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
                    >
                      Enroll <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* READ MORE MODAL */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-[#0a1628] border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative p-8">
              <button 
                onClick={() => setSelectedPolicy(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="bg-black p-3 rounded-2xl">
                  <ShieldCheck className="text-blue-400" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedPolicy.plan_name}</h2>
                  <p className="text-blue-400 font-medium">Coverage Details & Benefits</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#111e32] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Payout after {selectedPolicy.tenure}Y</p>
                  <p className="text-2xl font-bold text-emerald-400">${(selectedPolicy.premium_amount * selectedPolicy.tenure * 1.2).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 mt-1">*Estimated inclusive of 20% bonus</p>
                </div>
                <div className="bg-[#111e32] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Your Annual Premium</p>
                  <p className="text-2xl font-bold text-white">${selectedPolicy.premium_amount}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Payable every 12 months</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Plan Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPolicy.benefits?.split(",").map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 bg-[#111e32]/50 p-3 rounded-xl border border-slate-800/50">
                      <CheckCircle size={16} className="text-blue-500 shrink-0" />
                      <span className="text-sm">{benefit.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Description</h4>
                <p className="text-slate-400 text-sm leading-relaxed italic bg-black/20 p-4 rounded-xl border border-slate-800">
                  "{selectedPolicy.description}"
                </p>
              </div>

              <button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/30 active:scale-95"
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustApplyPolicy;
