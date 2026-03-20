import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar"; // Your sidebar component
import Navbar from "../components/Navbar"; // Your navbar component
import { toast } from "react-toastify";
import { ShieldCheck, Banknote, Clock } from "lucide-react";

function CustIssuedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const res = await API.get("/customer/my-policies");
      setPolicies(res.data);
    } catch (err) {
      toast.error("Failed to load your policies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCollectMoney = async (policyId) => {
    try {
      await API.post("/customer/collect-payout", { Policy_id: policyId });
      toast.success("Funds transferred! Policy has been settled.");
      setPolicies((prev) => prev.filter((p) => p.Policy_id !== policyId));
    } catch (err) {
      toast.error("Collection failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed width handled by your component */}
      <CustSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#0a1628]">Issued Policies</h1>
            <p className="text-gray-500 text-sm mt-1">
              Active protection plans eligible for payout collection.
            </p>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : policies.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
              <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No active policies found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {policies.map((policy) => (
                <div 
                  key={policy.Policy_id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Visual Header */}
                  <div className="bg-[#0a1628] p-4 text-white flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase opacity-60 font-bold tracking-widest">Policy ID</p>
                      <h3 className="font-mono font-bold text-lg">{policy.Policy_id}</h3>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-[10px] font-bold border border-green-500/30">
                      ACTIVE
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Plan:</span>
                      <span className="font-semibold">{policy.plan_name || "Basic Cover"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Coverage:</span>
                      <span className="font-bold text-blue-600">${policy.claim_amount?.toLocaleString()}</span>
                    </div>

                    <div className="pt-4">
                      {policy.is_collectible ? (
                        <button
                          onClick={() => handleCollectMoney(policy.Policy_id)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 animate-pulse transition-transform active:scale-95"
                        >
                          <Banknote size={18} /> Collect Money
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-400 py-3 bg-gray-50 rounded-xl text-xs border border-gray-100 italic">
                          <Clock size={14} /> Claim in Review or Not Filed
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
