import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { Plus, ShieldPlus, Trash2, Edit, CheckCircle2, X, Landmark } from "lucide-react";
import { toast } from "react-toastify";

function IssuePolicies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [newPolicy, setNewPolicy] = useState({
    plan_name: "",
    premium_amount: "",
    total_claim_amount: "",
    tenure: "",
    description: "",
    benefits: "",
    plan_type: "" // ✅ NEW FIELD
  });

  const fetchAvailablePolicies = async () => {
    try {
      const res = await API.get("/admin/available-policies");
      setPolicies(res.data);
    } catch {
      toast.error("Failed to fetch policies");
    }
  };

  useEffect(() => {
    fetchAvailablePolicies();
  }, []);

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPolicy,
        premium_amount: Number(newPolicy.premium_amount),
        total_claim_amount: Number(newPolicy.total_claim_amount),
        tenure: Number(newPolicy.tenure)
      };

      await API.post("/admin/add-policy", payload);

      toast.success("Policy added to catalog!");
      setShowModal(false);

      setNewPolicy({
        plan_name: "",
        premium_amount: "",
        total_claim_amount: "",
        tenure: "",
        description: "",
        benefits: "",
        plan_type: "" // reset
      });

      fetchAvailablePolicies();
    } catch (err) {
      const msg = err.response?.data?.detail || "Error adding policy.";
      toast.error(msg);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-white">POLICY CATALOG</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 px-8 py-3 rounded-2xl text-white font-bold"
          >
            <Plus size={20} /> Add New Policy
          </button>
        </div>

        {/* POLICY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {policies.map((p) => (
            <div key={p.id} className="bg-[#111e32]/80 p-6 rounded-3xl shadow-2xl">

              <div className="flex justify-between mb-4">
                <ShieldPlus className="text-blue-400" />
                <div className="flex gap-2">
                  <Edit size={18} />
                  <Trash2 size={18} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white">{p.plan_name}</h3>

              {/* ✅ PLAN TYPE */}
              <p className="text-xs text-blue-400 font-bold uppercase mb-2">
                {p.plan_type}
              </p>

              <p className="text-slate-400 text-sm mb-4">{p.description}</p>

              {/* CLAIM AMOUNT */}
              <div className="bg-emerald-500/10 p-3 rounded mb-4">
                <span className="text-white font-bold">
                  ₹{p.total_claim_amount}
                </span>
              </div>

              {/* BENEFITS */}
              <div className="mb-4">
                {p.benefits?.split(",").map((b, i) => (
                  <span key={i} className="text-blue-300 text-xs mr-2">
                    ✔ {b}
                  </span>
                ))}
              </div>

              <div className="flex justify-between text-sm">
                <span>₹{p.premium_amount}/yr</span>
                <span>{p.tenure} yrs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black flex justify-center items-center">
          <form
            onSubmit={handleAddPolicy}
            className="bg-[#0a1628] p-8 rounded w-full max-w-xl"
          >
            <h3 className="text-xl mb-4 text-white">Create Policy</h3>

            <input
              placeholder="Plan Name"
              value={newPolicy.plan_name}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, plan_name: e.target.value })
              }
              className="w-full mb-3 p-3 rounded"
              required
            />

            {/* ✅ PLAN TYPE */}
            <select
              value={newPolicy.plan_type}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, plan_type: e.target.value })
              }
              className="w-full mb-3 p-3 rounded"
              required
            >
              <option value="">Select Type</option>
              <option value="Health">Health</option>
              <option value="Auto">Auto</option>
            </select>

            <input
              type="number"
              placeholder="Premium"
              value={newPolicy.premium_amount}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, premium_amount: e.target.value })
              }
              className="w-full mb-3 p-3 rounded"
              required
            />

            <input
              type="number"
              placeholder="Total Claim Amount"
              value={newPolicy.total_claim_amount}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, total_claim_amount: e.target.value })
              }
              className="w-full mb-3 p-3 rounded"
              required
            />

            <input
              type="number"
              placeholder="Tenure"
              value={newPolicy.tenure}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, tenure: e.target.value })
              }
              className="w-full mb-3 p-3 rounded"
              required
            />

            <textarea
              placeholder="Description"
              value={newPolicy.description}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, description: e.target.value })
              }
              className="w-full mb-3 p-3 rounded"
              required
            />

            <textarea
              placeholder="Benefits (comma separated)"
              value={newPolicy.benefits}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, benefits: e.target.value })
              }
              className="w-full mb-3 p-3 rounded"
              required
            />

            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white">
                Add Policy
              </button>
              <button onClick={() => setShowModal(false)} type="button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default IssuePolicies;
