import { useState, useEffect } from "react";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

function CustApplyPolicy() {
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleEnroll = (policyId) => {
    // We will create the enrollment logic later as requested
    console.log("Enrolling in policy:", policyId);
    toast.info("Proceeding to enrollment...");
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        <main className="p-8 overflow-y-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-bold">Apply Policy</h1>
            <p className="text-slate-400 mt-2 italic text-sm font-medium">Customer Portal &gt; Available Plans</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availablePolicies.map((p) => (
                <div key={p.id} className="bg-[#111e32] border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 transition-all shadow-2xl relative group overflow-hidden">
                  {/* Subtle Background Icon Decoration */}
                  <ShieldCheck className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
                  
                  <div className="bg-black w-12 h-12 flex items-center justify-center rounded-2xl mb-6">
                    <ShieldCheck className="text-blue-400" size={24} />
                  </div>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{p.plan_name}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">{p.description || "Comprehensive coverage for your future peace of mind."}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Premium</span>
                      <span className="font-bold text-white">${p.premium_amount} / Year</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-bold text-white">{p.tenure} Years</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleEnroll(p.id)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-900/20"
                  >
                    Enroll Now <ArrowRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default CustApplyPolicy;
