import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import { ShieldCheck, Banknote, Clock } from "lucide-react";

function CustIssuedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await API.get("/customer/my-policies");
        setPolicies(res.data);
      } catch (err) {
        toast.error("Failed to load policies.");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleCollectMoney = async (policyId) => {
    try {
      await API.post("/customer/collect-payout", { Policy_id: policyId });
      toast.success("Funds transferred!");
      setPolicies((prev) => prev.filter((p) => p.Policy_id !== policyId));
    } catch (err) {
      toast.error("Collection failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        <main className="p-8 overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Issued Policies</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your active protection plans.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
          ) : policies.length === 0 ? (
            <div className="bg-[#111e32] border border-slate-800 rounded-2xl p-16 text-center shadow-2xl">
              <ShieldCheck size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-400 font-medium">No active policies found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {policies.map((policy) => (
                <div key={policy.Policy_id} className="bg-[#111e32] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden hover:border-slate-600 transition-all">
                  <div className="bg-[#1a2c46] p-4 flex justify-between items-center border-b border-slate-800">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Policy ID</p>
                      <h3 className="font-mono font-bold text-blue-400">{policy.Policy_id}</h3>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold border border-emerald-500/20">ACTIVE</div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Plan:</span><span>{policy.plan_name || "Auto Protection"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Coverage:</span><span className="font-bold text-blue-400">${policy.claim_amount?.toLocaleString()}</span></div>
                    <div className="pt-4">
                      {policy.is_collectible ? (
                        <button onClick={() => handleCollectMoney(policy.Policy_id)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 animate-pulse transition-all">
                          <Banknote size={18} /> Collect Money
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-slate-500 py-3 bg-[#0a1628]/50 rounded-xl text-xs border border-slate-800 italic">
                          <Clock size={14} /> Claim in Review
                        </div>
                      )}
                    </div>
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
