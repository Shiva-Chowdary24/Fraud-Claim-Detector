import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { Plus, ShieldPlus, Trash2, Edit, CheckCircle2, X, Landmark, Tag, Calendar, DollarSign } from "lucide-react";
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
    plan_type: ""
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
      toast.success("Policy published to catalog!");
      setShowModal(false);
      setNewPolicy({
        plan_name: "", premium_amount: "", total_claim_amount: "",
        tenure: "", description: "", benefits: "", plan_type: ""
      });
      fetchAvailablePolicies();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error adding policy.");
    }
  };

  // Reusable Input Style
  const inputStyle = "w-full bg-[#0a0f1a] border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner";

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">POLICY CATALOG</h2>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest">Manage Insurance Offerings</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-white font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={20} /> Add New Policy
          </button>
        </div>

        {/* POLICY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {policies.map((p) => (
            <div key={p.id} className="bg-[#111e32]/40 backdrop-blur-md border border-slate-800/50 p-8 rounded-[2rem] shadow-2xl hover:border-blue-500/30 transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                  <ShieldPlus className="text-blue-400" size={28} />
                </div>
                <div className="flex gap-4 text-slate-500">
                  <Edit size={18} className="hover:text-blue-400 cursor-pointer transition-colors" />
                  <Trash2 size={18} className="hover:text-red-400 cursor-pointer transition-colors" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{p.plan_name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <Tag size={12} className="text-slate-500" />
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                  {p.plan_type}
                </span>
              </div>

              <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-2">{p.description}</p>

              {/* COVERAGE BOX */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl mb-6">
                <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-1">Max Coverage</p>
                <p className="text-2xl font-black text-white">₹{p.total_claim_amount?.toLocaleString()}</p>
              </div>

              {/* BENEFITS LIST */}
              <div className="flex-1 space-y-2 mb-6">
                {p.benefits?.split(",").map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 text-xs">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                    <span className="truncate">{b.trim()}</span>
                  </div>
                ))}
              </div>

              {/* FOOTER STATS */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Premium</p>
                  <p className="text-white font-black text-lg">₹{p.premium_amount}<span className="text-[10px] text-slate-500 ml-1">/yr</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tenure</p>
                  <p className="text-white font-bold">{p.tenure} Years</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form
            onSubmit={handleAddPolicy}
            className="bg-[#0f172a] border border-slate-800 p-10 rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Create Policy</h3>
                <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Catalog Entry Form</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                type="button" 
                className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Plan Identity</label>
                  <input
                    placeholder="e.g. Platinum Health Guard"
                    value={newPolicy.plan_name}
                    onChange={(e) => setNewPolicy({ ...newPolicy, plan_name: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Category</label>
                  <select
                    value={newPolicy.plan_type}
                    onChange={(e) => setNewPolicy({ ...newPolicy, plan_type: e.target.value })}
                    className={inputStyle + " appearance-none"}
                    required
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="Health">Health Insurance</option>
                    <option value="Auto">Auto Insurance</option>
                    <option value="Life">Life Insurance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Annual Premium (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={newPolicy.premium_amount}
                    onChange={(e) => setNewPolicy({ ...newPolicy, premium_amount: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Max Claim (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={newPolicy.total_claim_amount}
                    onChange={(e) => setNewPolicy({ ...newPolicy, total_claim_amount: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Policy Tenure (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={newPolicy.tenure}
                  onChange={(e) => setNewPolicy({ ...newPolicy, tenure: e.target.value })}
                  className={inputStyle}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Plan Summary</label>
                <textarea
                  placeholder="Describe coverage details..."
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  className={inputStyle + " h-20 resize-none"}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Key Benefits</label>
                <textarea
                  placeholder="Benefit 1, Benefit 2, Benefit 3..."
                  value={newPolicy.benefits}
                  onChange={(e) => setNewPolicy({ ...newPolicy, benefits: e.target.value })}
                  className={inputStyle + " h-20 resize-none"}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/40"
              >
                Publish Policy
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                type="button"
                className="flex-1 bg-slate-800/50 hover:bg-slate-800 py-4 rounded-2xl text-slate-400 font-bold uppercase tracking-widest text-xs transition-all"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default IssuePolicies;
