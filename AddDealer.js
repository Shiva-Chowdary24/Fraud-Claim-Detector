import { useState } from "react";
import API from "../api"; 
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { Hash, Activity, Users, Calendar, DollarSign, Plus } from "lucide-react";

function AddDealer() {
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/admin/dealer/add", form);
      toast.success(res.data.message || "Dealer Added Successfully");
      setForm({});
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding dealer");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-10 tracking-widest uppercase border-b border-white pb-2 inline-block">
          Add New Dealer
        </h2>

        <form onSubmit={submit} className="space-y-8">
          {[
            { name: "Policy", placeholder: "Policy ID", icon: <Hash size={18}/> },
            { name: "Policy Status", placeholder: "Policy Status", icon: <Activity size={18}/> },
            { name: "Broker Dealer", placeholder: "Broker Dealer Name", icon: <Users size={18}/> },
            { name: "Issue date", placeholder: "Issue Date", icon: <Calendar size={18}/>, type: "date" },
            { name: "Contribution", placeholder: "Contribution Amount", icon: <DollarSign size={18}/>, type: "number" },
          ].map((field) => (
            <div key={field.name} className="relative group">
              <div className="absolute left-0 top-2 text-gray-500 group-focus-within:text-white transition-colors">
                {field.icon}
              </div>
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                required
                value={form[field.name] || ""}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-700 py-2 pl-8 outline-none focus:border-white transition-all text-white placeholder-gray-600"
              />
            </div>
          ))}

          <button className="mt-4 flex items-center justify-center gap-2 w-full border border-white p-3 hover:bg-white hover:text-black font-bold uppercase transition-all">
            <Plus size={18} /> Confirm Entry
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddDealer;
