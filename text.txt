import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { Plus, ShieldPlus, Trash2, Edit, CheckCircle2, X } from "lucide-react";
import { toast } from "react-toastify";

function IssuePolicies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // State for adding a new policy
  const [newPolicy, setNewPolicy] = useState({
    plan_name: "",
    premium_amount: "",
    tenure: "",
    description: "",
    benefits: "" 
  });

  // Fetch policies from backend
  const fetchAvailablePolicies = async () => {
    try {
      const res = await API.get("/admin/available-policies");
      setPolicies(res.data);
    } catch (err) {
      toast.error("Failed to fetch policies");
    }
  };

  useEffect(() => { 
    fetchAvailablePolicies(); 
  }, []);

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    try {
      // 500 ERROR FIX: Convert string inputs to Numbers before sending to FastAPI
      const payload = { 
        ...newPolicy, 
        premium_amount: Number(newPolicy.premium_amount), 
        tenure: Number(newPolicy.tenure) 
      };

      await API.post("/admin/add-policy", payload);
      
      toast.success("Policy added to catalog!");
      setShowModal(false);
      
      // Reset State
      setNewPolicy({ 
        plan_name: "", 
        premium_amount: "", 
        tenure: "", 
        description: "", 
        benefits: "" 
      }); 
      
      fetchAvailablePolicies();
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      const msg = err.response?.data?.detail || "Error adding policy. Check backend console.";
      toast.error(msg);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">POLICY CATALOG</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={20} /> Add New Policy
          </button>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {policies.map((p) => (
            <div key={p.id} className="bg-[#111e32]/80 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col h-full hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-black p-3 rounded-xl border border-slate-700 shadow-inner">
                  <ShieldPlus className="text-blue-400" size={24} />
                </div>
                <div className="flex gap-3">
                  <button className="text-slate-500 hover:text-white transition-colors"><Edit size={18}/></button>
                  <button className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{p.plan_name}</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{p.description}</p>
              
              {/* Benefits Section */}
              <div className="flex-1 mb-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-[0.2em]">Key Benefits</p>
                <div className="flex flex-wrap gap-2">
                  {p.benefits?.split(",").map((benefit, idx) => (
                    <span key={idx} className="bg-blue-500/10 text-blue-300 text-[10px] px-3 py-1.5 rounded-lg border border-blue-500/20 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 size={12} className="text-blue-500" /> {benefit.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-center border-t border-slate-800/50 pt-5 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Premium</span>
                  <span className="text-emerald-400 text-lg font-black">${p.premium_amount}<span className="text-xs text-slate-500 font-normal">/yr</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tenure</span>
                  <p className="text-slate-300 text-sm font-bold">{p.tenure} Years</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center z-50 p-4">
          <form 
            onSubmit={handleAddPolicy} 
            className="bg-[#0a1628] border border-slate-800 p-10 rounded-[2.5rem] w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-bold text-white">Create Policy</h3>
                <p className="text-slate-400 text-sm mt-1">Populate your catalog with a new insurance plan.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Plan Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Plan Title</label>
                <input 
                  className="w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  placeholder="e.g. Diamond Health Shield" 
                  value={newPolicy.plan_name}
                  onChange={(e) => setNewPolicy({...newPolicy, plan_name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Premium Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Premium ($)</label>
                  <input 
                    className="w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    type="number" 
                    placeholder="1500" 
                    value={newPolicy.premium_amount}
                    onChange={(e) => setNewPolicy({...newPolicy, premium_amount: e.target.value})} 
                    required 
                  />
                </div>
                {/* Tenure */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tenure (Years)</label>
                  <input 
                    className="w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    type="number" 
                    placeholder="10" 
                    value={newPolicy.tenure}
                    onChange={(e) => setNewPolicy({...newPolicy, tenure: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                <textarea 
                  className="w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 h-24 transition-all" 
                  placeholder="Summarize the coverage and target audience..." 
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})} 
                  required 
                />
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Benefits (Comma Separated)</label>
                <textarea 
                  className="w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 h-28 transition-all" 
                  placeholder="Free Checkups, Fast Payouts, Global Support" 
                  value={newPolicy.benefits}
                  onChange={(e) => setNewPolicy({...newPolicy, benefits: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="flex gap-6 mt-10">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="flex-1 text-slate-500 font-bold hover:text-white transition-colors"
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 py-4 rounded-2xl text-white font-bold hover:bg-blue-500 shadow-xl shadow-blue-900/40 active:scale-95 transition-all"
              >
                Publish Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default IssuePolicies;
