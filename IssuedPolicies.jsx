import { useEffect, useState } from "react";
import API from "../services/api";
import CustLayout from "../components/CustLayout"; // Assuming you have a customer layout
import { toast } from "react-toastify";
import { ShieldCheck, Banknote, Clock, Trash2 } from "lucide-react";

function IssuedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch policies on load
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

  // Logic to "Collect Money" and remove policy
  const handleCollectMoney = async (policyId) => {
    try {
      // API call to process payment and archive/delete policy
      await API.post("/customer/collect-payout", { Policy_id: policyId });
      
      toast.success("Funds transferred! Policy has been settled and removed.");
      
      // Remove from UI immediately
      setPolicies((prev) => prev.filter((p) => p.Policy_id !== policyId));
    } catch (err) {
      toast.error("Collection failed. Please contact support.");
    }
  };

  return (
    <CustLayout>
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a1628]">Issued Policies</h1>
          <p className="text-gray-500">Manage your active protection plans and collect verified claims.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : policies.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">You don't have any active issued policies yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <div 
                key={policy.Policy_id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Policy Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">Policy ID</span>
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] backdrop-blur-md">ACTIVE</span>
                  </div>
                  <h3 className="text-lg font-bold mt-1">{policy.Policy_id}</h3>
                </div>

                {/* Policy Body */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Plan Type:</span>
                    <span className="font-semibold text-gray-800">{policy.plan_name || "General Protection"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Coverage:</span>
                    <span className="font-semibold text-gray-800">${policy.claim_amount?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Issued On:</span>
                    <span className="font-semibold text-gray-800">{new Date(policy.issue_date).toLocaleDateString()}</span>
                  </div>

                  <hr className="border-gray-50" />

                  {/* Action Section */}
                  <div className="pt-2">
                    {policy.is_collectible ? (
                      <button
                        onClick={() => handleCollectMoney(policy.Policy_id)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 animate-pulse transition-all"
                      >
                        <Banknote size={18} /> Collect Money
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-gray-400 py-3 bg-gray-50 rounded-xl text-sm italic">
                        <Clock size={16} /> No Claims Pending
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustLayout>
  );
}

export default IssuedPolicies;
