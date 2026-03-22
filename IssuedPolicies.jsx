import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { Plus, ShieldPlus, Trash2, Edit, CheckCircle2, X, Landmark, Tag } from "lucide-react";
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
      toast.success("Policy published!");
      setShowModal(false);
      setNewPolicy({
        plan_name: "", premium_amount: "", total_claim_amount: "",
        tenure: "", description: "", benefits: "", plan_type: ""
      });
      fetchAvailablePolicies();
    } catch (err) {
      toast.error("Error adding policy.");
    }
  };

  // Optimized Medium Input Style
  const inputStyle = "w-full bg-[#0a0f1a] border border-slate-800 p-3 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner";

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">POLICY CATALOG</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-1">Underwriting & Asset Management</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> New Policy
          </button>
        </div>

        {/* POLICY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((p) => (
            <div key={p.id} className="bg-[#111e32]/40 backdrop-blur-md border border-slate-800/50 p-6 rounded-[1.5rem] shadow-2xl flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                  <ShieldPlus className="text-blue-400" size={22} />
                </div>
                <div className="flex gap-3 text-slate-600">
                  <Edit size={16} className="hover:text-blue-400 cursor-pointer transition-colors" />
                  <Trash2 size={16} className="hover:text-red-400 cursor-pointer transition-colors" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{p.plan_name}</h3>
              <div className="flex items-center gap-1.5 mb-3">
                <Tag size={10} className="text-slate-500" />
                <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                  {p.plan_type}
                </span>
              </div>

              <p className="text-slate-400 text-xs mb-4 leading-relaxed line-clamp-2">{p.description}</p>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl mb-4 text-center">
                <p className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest">Max Coverage</p>
                <p className="text-xl font-black text-white">₹{p.total_claim_amount?.toLocaleString()}</p>
              </div>

              <div className="flex-1 space-y-1.5 mb-4">
                {p.benefits?.split(",").slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 text-[10px]">
                    <CheckCircle2 size={12} className="text-blue-500 shrink-0" />
                    <span className="truncate">{b.trim()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Premium</p>
                  <p className="text-white font-black">₹{p.premium_amount}<span className="text-[9px] text-slate-500 font-normal ml-0.5">/yr</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Tenure</p>
                  <p className="text-white font-bold text-sm">{p.tenure} Yrs</p>
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
            className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-white">Create Policy</h3>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">Add new asset to catalog</p>
              </div>
              <button onClick={() => setShowModal(false)} type="button" className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Row 1 */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Plan Name</label>
                <input
                  placeholder="e.g. Health Guard"
                  value={newPolicy.plan_name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, plan_name: e.target.value })}
                  className={inputStyle}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Plan Category</label>
                <select
                  value={newPolicy.plan_type}
                  onChange={(e) => setNewPolicy({ ...newPolicy, plan_type: e.target.value })}
                  className={inputStyle}
                  required
                >
                  <option value="" disabled>Select Type</option>
                  <option value="Health">Health</option>
                  <option value="Auto">Auto</option>
                  <option value="Life">Life</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Annual Premium (₹)</label>
                <input
                  type="number"
                  placeholder="12000"
                  value={newPolicy.premium_amount}
                  onChange={(e) => setNewPolicy({ ...newPolicy, premium_amount: e.target.value })}
                  className={inputStyle}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Sum Assured (₹)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={newPolicy.total_claim_amount}
                  onChange={(e) => setNewPolicy({ ...newPolicy, total_claim_amount: e.target.value })}
                  className={inputStyle}
                  required
                />
              </div>

              {/* Row 3 - Full Width for Description */}
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tenure & Description</label>
                <div className="flex gap-4">
                    <input
                        type="number"
                        placeholder="Yrs"
                        value={newPolicy.tenure}
                        onChange={(e) => setNewPolicy({ ...newPolicy, tenure: e.target.value })}
                        className={`${inputStyle} w-24`}
                        required
                    />
                    <input
                        placeholder="Short summary of the plan..."
                        value={newPolicy.description}
                        onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                        className={inputStyle}
                        required
                    />
                </div>
              </div>

              {/* Row 4 - Full Width for Benefits */}
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Benefits (Comma Separated)</label>
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
                className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all"
              >
                Publish Policy
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                type="button"
                className="flex-1 bg-slate-800/50 hover:bg-slate-800 py-3 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest transition-all"
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
