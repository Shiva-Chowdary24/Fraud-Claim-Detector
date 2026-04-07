import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import {
  Plus,
  ShieldPlus,
  Trash2,
  Edit,
  CheckCircle2,
  X,
  Tag
} from "lucide-react";
import { toast } from "react-toastify";

function IssuePolicies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Policy creation type
  const [policyMode, setPolicyMode] = useState("NORMAL");

  // Policy catalog filter
  const [policyFilter, setPolicyFilter] = useState("NORMAL");

  const [newPolicy, setNewPolicy] = useState({
    plan_name: "",
    plan_type: "",
    premium_amount: "",
    total_claim_amount: "",
    tenure: "",
    description: "",
    benefits: "",
    dividend_rate: ""
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
        plan_name: newPolicy.plan_name,
        plan_type: newPolicy.plan_type,
        premium_amount: Number(newPolicy.premium_amount),
        total_claim_amount: Number(newPolicy.total_claim_amount),
        tenure: Number(newPolicy.tenure),
        description: newPolicy.description,
        benefits: newPolicy.benefits,
        policy_mode: policyMode
      };

      if (policyMode === "DIVIDEND") {
        payload.dividend_rate = Number(newPolicy.dividend_rate);
        payload.dividend_reinvestment = true;
      }

      await API.post("/admin/add-policy", payload);
      toast.success("Policy published!");

      setShowModal(false);
      setPolicyMode("NORMAL");

      setNewPolicy({
        plan_name: "",
        plan_type: "",
        premium_amount: "",
        total_claim_amount: "",
        tenure: "",
        description: "",
        benefits: "",
        dividend_rate: ""
      });

      fetchAvailablePolicies();
    } catch {
      toast.error("Error adding policy");
    }
  };

  const inputStyle =
    "w-full bg-[#0a0f1a] border border-slate-800 p-3 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner";

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black text-white">POLICY CATALOG</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">
              Underwriting & Asset Management
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex gap-2 bg-blue-600 px-6 py-3 rounded-xl text-white font-bold"
          >
            <Plus size={18} /> New Policy
          </button>
        </div>

        {/* ✅ POLICY FILTER */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setPolicyFilter("NORMAL")}
            className={`px-5 py-2 rounded-xl text-sm font-bold
              ${
                policyFilter === "NORMAL"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
          >
            Normal Policies
          </button>

          <button
            onClick={() => setPolicyFilter("DIVIDEND")}
            className={`px-5 py-2 rounded-xl text-sm font-bold
              ${
                policyFilter === "DIVIDEND"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
          >
            Dividend Policies
          </button>
        </div>

        {/* ✅ POLICY CATALOG */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies
            .filter((p) => p.policy_mode === policyFilter)
            .map((p) => (
              <div
                key={p._id}
                className="bg-[#111e32]/40 backdrop-blur-md border border-slate-800/50
                           p-6 rounded-[1.5rem] shadow-2xl flex flex-col"
              >
                <div className="flex justify-between mb-4">
                  <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                    <ShieldPlus size={22} className="text-blue-400" />
                  </div>
                  <div className="flex gap-3 text-slate-600">
                    <Edit size={16} />
                    <Trash2 size={16} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{p.plan_name}</h3>

                {/* ✅ PLAN TYPE + DIVIDEND INFO */}
                <div className="flex gap-2 items-center my-2 flex-wrap">
                  <Tag size={12} className="text-slate-500" />
                  <span className="text-[9px] text-blue-400 uppercase font-black">
                    {p.plan_type}
                  </span>

                  {p.policy_mode === "DIVIDEND" && (
                    <>
                      <span className="text-[9px] text-emerald-400 font-bold ml-1">
                        DIVIDEND
                      </span>
                      <span className="text-[9px] text-emerald-300 font-semibold bg-emerald-500/10
                                       px-2 py-0.5 rounded border border-emerald-500/20">
                        {p.dividend_rate}% p.a.
                      </span>
                    </>
                  )}
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                  {p.description}
                </p>

                <div className="bg-emerald-500/5 border border-emerald-500/10
                                p-4 rounded-xl text-center mb-4">
                  <p className="text-[9px] text-emerald-500 uppercase">
                    MAX COVERAGE
                  </p>
                  <p className="text-2xl font-black text-white">
                    ₹{p.total_claim_amount?.toLocaleString()}
                  </p>
                </div>

                <div className="flex-1 space-y-2 mb-4">
                  {p.benefits
                    ?.split(",")
                    .slice(0, 3)
                    .map((b, i) => (
                      <div key={i} className="flex gap-2 text-slate-300 text-xs">
                        <CheckCircle2 size={14} className="text-blue-500" />
                        {b.trim()}
                      </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800/50">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase">
                      Premium
                    </p>
                    <p className="text-white font-black">
                      ₹{p.premium_amount}/yr
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase">
                      Tenure
                    </p>
                    <p className="text-white font-black">{p.tenure} Yrs</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ✅ MODAL — ADD / PUBLISH POLICY */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <form
            onSubmit={handleAddPolicy}
            className="bg-[#0f172a] p-8 rounded-[2rem] w-full max-w-2xl border border-slate-800"
          >
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-black text-white">Create Policy</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* POLICY TYPE */}
            <div className="flex gap-6 text-sm text-slate-300 mb-6">
              <label>
                <input
                  type="radio"
                  checked={policyMode === "NORMAL"}
                  onChange={() => setPolicyMode("NORMAL")}
                /> Normal Policy
              </label>
              <label>
                <input
                  type="radio"
                  checked={policyMode === "DIVIDEND"}
                  onChange={() => setPolicyMode("DIVIDEND")}
                /> Dividend Policy
              </label>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-2 gap-4">

              <input className={inputStyle} placeholder="Plan Name" required
                value={newPolicy.plan_name}
                onChange={(e) => setNewPolicy({ ...newPolicy, plan_name: e.target.value })} />

              <select className={inputStyle} required
                value={newPolicy.plan_type}
                onChange={(e) => setNewPolicy({ ...newPolicy, plan_type: e.target.value })}>
                <option value="">Select Type</option>
                <option value="Health">Health</option>
                <option value="Auto">Auto</option>
                <option value="Life">Life</option>
              </select>

              <input className={inputStyle} type="number" placeholder="Annual Premium" required
                value={newPolicy.premium_amount}
                onChange={(e) => setNewPolicy({ ...newPolicy, premium_amount: e.target.value })} />

              <input className={inputStyle} type="number" placeholder="Tenure" required
                value={newPolicy.tenure}
                onChange={(e) => setNewPolicy({ ...newPolicy, tenure: e.target.value })} />

              <input className={inputStyle} type="number" placeholder="Sum Assured" required
                value={newPolicy.total_claim_amount}
                onChange={(e) => setNewPolicy({ ...newPolicy, total_claim_amount: e.target.value })} />

              <textarea className={`${inputStyle} col-span-2 h-28 resize-none`}
                placeholder="Description"
                required
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })} />

              <textarea className={`${inputStyle} col-span-2 h-36 resize-none`}
                placeholder="Benefits (Comma separated)"
                required
                value={newPolicy.benefits}
                onChange={(e) => setNewPolicy({ ...newPolicy, benefits: e.target.value })} />

              {policyMode === "DIVIDEND" && (
                <input
                  className={inputStyle}
                  type="number"
                  placeholder="Dividend Rate (%)"
                  required
                  value={newPolicy.dividend_rate}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, dividend_rate: e.target.value })
                  }
                />
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button className="flex-1 bg-blue-600 py-3 rounded-xl text-white font-bold">
                Publish Policy
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-800 py-3 rounded-xl text-slate-400 font-bold"
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
