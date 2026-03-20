import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { Plus, ShieldPlus, Trash2, Edit } from "lucide-react";
import { toast } from "react-toastify";

function IssuePolicies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    plan_name: "",
    premium_amount: "",
    tenure: "",
    description: ""
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
      await API.post("/admin/add-policy", newPolicy);
      toast.success("Policy added to catalog!");
      setShowModal(false);
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
          <h2 className="text-2xl font-bold text-white">Policy Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((p) => (
            <div key={p.id} className="bg-[#111e32] border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black p-2 rounded-lg"><ShieldPlus className="text-blue-400" /></div>
                <div className="flex gap-2">
                  <button className="text-slate-500 hover:text-white"><Edit size={18}/></button>
                  <button className="text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{p.plan_name}</h3>
              <p className="text-slate-400 text-sm mb-4">{p.description}</p>
              <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                <span className="text-blue-400 font-bold">${p.premium_amount}/yr</span>
                <span className="text-slate-500 text-xs">{p.tenure} Years</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <form onSubmit={handleAddPolicy} className="bg-[#0a1628] border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Create New Policy</h3>
            <input className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-lg mb-4 text-white" placeholder="Plan Name" onChange={(e) => setNewPolicy({...newPolicy, plan_name: e.target.value})} required />
            <input className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-lg mb-4 text-white" type="number" placeholder="Premium Amount" onChange={(e) => setNewPolicy({...newPolicy, premium_amount: e.target.value})} required />
            <input className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-lg mb-4 text-white" type="number" placeholder="Tenure (Years)" onChange={(e) => setNewPolicy({...newPolicy, tenure: e.target.value})} required />
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-slate-400 font-bold">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-lg text-white font-bold">Save Policy</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
export default IssuePolicies;
