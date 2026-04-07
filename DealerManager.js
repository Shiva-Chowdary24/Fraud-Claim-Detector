import { useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { Search, Hash, Activity, Users, Calendar, DollarSign, Save } from "lucide-react";

function DealerManager() {
  const [policySearch, setPolicySearch] = useState("");
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!policySearch) return;

    setLoading(true);
    try {
      const res = await API.get(`/dealers/search?policy=${policySearch}`);
      setDealer(res.data);
    } catch (err) {
      setDealer(null);
      toast.error("Policy not found in records");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/dealers/${dealer.id}`, {
        "Policy Status": dealer["Policy Status"],
        "Contribution": parseFloat(dealer.Contribution),
      });
      toast.success("Dealer entry updated successfully");
    } catch (err) {
      toast.error("Failed to update dealer entry");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">

        {/* Page Title */}
        <h2 className="text-xl font-bold mb-10 tracking-widest uppercase border-b border-white pb-2 inline-block">
          Manage Dealer
        </h2>

        {/* Search Section */}
        <form onSubmit={handleSearch} className="relative group mb-10">
          <div className="absolute left-0 top-2 text-gray-500 group-focus-within:text-white">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="ENTER POLICY ID"
            value={policySearch}
            onChange={(e) => setPolicySearch(e.target.value)}
            className="w-full bg-transparent border-b border-gray-700 py-2 pl-8 outline-none focus:border-white transition-all text-white placeholder-gray-600 uppercase"
          />
          <button
            type="submit"
            className="mt-4 w-full border border-white py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            {loading ? "Searching..." : "Find Dealer"}
          </button>
        </form>

        {/* Update Form */}
        {dealer && (
          <form onSubmit={handleUpdate} className="space-y-8 animate-fade-in">

            {[
              { label: "Policy ID", value: dealer.Policy, icon: <Hash size={18} />, disabled: true },
              {
                label: "Policy Status",
                value: dealer["Policy Status"],
                icon: <Activity size={18} />,
                onChange: (v) => setDealer({ ...dealer, "Policy Status": v }),
              },
              { label: "Broker Dealer", value: dealer["Broker Dealer"], icon: <Users size={18} />, disabled: true },
              { label: "Issue Date", value: dealer["Issue date"], icon: <Calendar size={18} />, disabled: true },
              {
                label: "Contribution",
                value: dealer.Contribution,
                icon: <DollarSign size={18} />,
                type: "number",
                onChange: (v) => setDealer({ ...dealer, Contribution: v }),
              },
            ].map((field, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute left-0 top-2 text-gray-500 group-focus-within:text-white">
                  {field.icon}
                </div>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  disabled={field.disabled}
                  onChange={(e) => field.onChange?.(e.target.value)}
                  placeholder={field.label}
                  className={`w-full bg-transparent border-b border-gray-700 py-2 pl-8 outline-none transition-all
                    ${field.disabled ? "text-gray-500 cursor-not-allowed" : "focus:border-white text-white"}
                  `}
                />
              </div>
            ))}

            <button
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 w-full border border-white p-3 hover:bg-white hover:text-black font-bold uppercase transition-all"
            >
              <Save size={18} /> Update Dealer
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

export default DealerManager;
