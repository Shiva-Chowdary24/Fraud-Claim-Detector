import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { Plus, ShieldPlus, Trash2, Edit, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

function IssuePolicies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Added 'benefits' to the state
  const [newPolicy, setNewPolicy] = useState({
    plan_name: "",
    premium_amount: "",
    tenure: "",
    description: "",
    benefits: "" // Comma separated string
  });

  const fetchAvailablePolicies = async () => {
    try {
      const res = await API.get("/admin/available-policies");
      setPolicies(res.data);
    } catch (err) {
      toast.error("Failed to fetch policies");
    }
  };

  useEffect(() => { fetchAvailablePolicies(); }, []);

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    try {
      // Logic to convert comma-separated string to an array if your backend prefers it
      // const payload = { ...newPolicy, benefits: newPolicy.benefits.split(",").map(b => b.trim()) };
      
      await API.post("/admin/add-policy", newPolicy);
      toast.success("Policy with benefits added!");
      setShowModal(false);
      setNewPolicy({ plan_name: "", premium_amount: "", tenure: "", description: "", benefits: "" }); // Reset
      fetchAvailablePolicies();
    } catch (err) {
      toast.error("Error adding policy");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            <Plus size={20} /> Add Policy
          </button>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Policy Catalog</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((p) => (
            <div key={p.id} className="bg-[#111e32] border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black p-2 rounded-lg"><ShieldPlus className="text-blue-400" /></div>
                <div className="flex gap-2">
                  <button className="text-slate-500 hover:text-white"><Edit size={18}/></button>
                  <button className="text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{p.plan_name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{p.description}</p>
              
              {/* Displaying Benefits as Tags */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Key Benefits</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.benefits?.split(",").map((benefit, idx) => (
                    <span key={idx} className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                      <CheckCircle2 size={10} /> {benefit.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-auto">
                <span className="text-emerald-400 font-bold">${p.premium_amount}/yr</span>
                <span className="text-slate-500 text-xs font-medium">{p.tenure} Years Tenure</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for adding Policy */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <form onSubmit={handleAddPolicy} className="bg-[#0a1628] border border-slate-700 p-8 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-2">Create New Policy</h3>
            <p className="text-slate-400 text-sm mb-6">Define the plan details and benefits for customers.</p>
            
            <div className="space-y-4">
              <input className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" placeholder="Plan Name (e.g. Platinum Shield)" onChange={(e) => setNewPolicy({...newPolicy, plan_name: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <input className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" type="number" placeholder="Premium ($)" onChange={(e) => setNewPolicy({...newPolicy, premium_amount: e.target.value})} required />
                <input className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" type="number" placeholder="Tenure (Years)" onChange={(e) => setNewPolicy({...newPolicy, tenure: e.target.value})} required />
              </div>

              <textarea className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 h-20" placeholder="Short Description" onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})} required />

              {/* NEW: Benefits Input */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Benefits (comma separated)</label>
                <textarea 
                  className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 h-24 mt-1" 
                  placeholder="e.g. Full Coverage, Fast Claims, 24/7 Support" 
                  onChange={(e) => setNewPolicy({...newPolicy, benefits: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20">Create Policy</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
export default IssuePolicies;
