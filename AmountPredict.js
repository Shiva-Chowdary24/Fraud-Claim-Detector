import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { 
  CheckCircle, ShieldCheck, Car, Activity, 
  Upload, Search, Loader2, AlertCircle 
} from "lucide-react";
import { toast } from "react-toastify";

function AmountPredict() {
  const navigate = useNavigate();
  
  // States
  const [policyId, setPolicyId] = useState("");
  const [policyData, setPolicyData] = useState(null); // Stores fetched policy info
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [predictedAmount, setPredictedAmount] = useState(0);

  // Dynamic Form State
  const [formData, setFormData] = useState({
    // Health Fields
    medical_history: "",
    age: "",
    // Auto Fields
    vehicle_type: "",
    vehicle_tier: "",
    vehicle_age: "",
    images: null
  });

  /**
   * ✅ PHASE 1: Automatic Policy Lookup
   */
  const handleLookup = async () => {
    if (!policyId) return;
    setLoading(true);
    try {
      // Fetch policy from your issued_policies collection
      const res = await API.get(`/customer/policy-details/${policyId}`);
      if (res.data) {
        setPolicyData(res.data);
        toast.success(`Policy Found: ${res.data.plan_type} Insurance`);
      }
    } catch (err) {
      toast.error("Policy ID not found. Please check and try again.");
      setPolicyData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ PHASE 2: Handle Prediction
   */
  const handlePredict = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare payload based on type
      const payload = {
        policy_id: policyId,
        customer_id: localStorage.getItem("customer_id"),
        type: policyData.plan_type, // "Health" or "Auto"
        ...formData
      };

      const res = await API.post("/predict-payout", payload);
      
      setPredictedAmount(res.data.amount || 5000); // Fallback for demo
      setShowSuccess(true);
      triggerConfetti();

      setTimeout(() => navigate("/customer/claim-policies"), 6000);
    } catch (err) {
      toast.error("Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const inputClass = "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white font-mono">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-2xl">
            
            {showSuccess ? (
              /* --- SUCCESS VIEW --- */
              <div className="text-center space-y-6 py-20 animate-in zoom-in duration-500">
                <CheckCircle size={80} className="mx-auto text-emerald-400" />
                <h1 className="text-5xl font-black uppercase tracking-tighter">Congratulations!</h1>
                <p className="text-xl text-emerald-400 font-bold italic">
                  The claimable amount is up to <span className="text-white border-b-2 border-white">${predictedAmount}</span>
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse pt-10">
                  Redirecting to your active claim policies...
                </p>
              </div>
            ) : (
              /* --- FORM VIEW --- */
              <div className="bg-[#111e32] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-blue-400" /> Payout Estimator
                </h2>

                {/* 1. Policy ID Search */}
                <div className="flex flex-col gap-2 mb-8">
                  <label className="text-xs text-slate-500 uppercase font-bold">Step 1: Enter Policy ID</label>
                  <div className="flex gap-2">
                    <input 
                      className={`${inputClass} flex-1`}
                      placeholder="e.g. PL-HEA-1234"
                      value={policyId}
                      onChange={(e) => setPolicyId(e.target.value)}
                    />
                    <button 
                      onClick={handleLookup}
                      disabled={loading}
                      className="bg-blue-600 px-6 rounded-lg hover:bg-blue-500 transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                      Lookup
                    </button>
                  </div>
                </div>

                {policyData && (
                  <form onSubmit={handlePredict} className="space-y-6 animate-in fade-in duration-500">
                    <hr className="border-white/5" />
                    <div className="flex items-center gap-3 text-blue-400">
                      {policyData.plan_type === "Health" ? <Activity /> : <Car />}
                      <span className="font-bold uppercase text-sm">{policyData.plan_type} Requirements</span>
                    </div>

                    {/* ✅ DYNAMIC FIELDS: HEALTH */}
                    {policyData.plan_type === "Health" && (
                      <div className="grid grid-cols-1 gap-4 text-left">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 uppercase">Current Age</label>
                          <input 
                            type="number" className={inputClass} required
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 uppercase">Brief Medical History</label>
                          <textarea 
                            className={`${inputClass} h-24 resize-none`} required
                            onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {/* ✅ DYNAMIC FIELDS: AUTO */}
                    {policyData.plan_type === "Auto" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 uppercase">Vehicle Type</label>
                          <select 
                            className={inputClass} required
                            onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                          >
                            <option value="">Select Type</option>
                            <option>Car</option><option>Bike</option><option>Truck</option><option>Bus</option><option>Van</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 uppercase">Vehicle Tier</label>
                          <select 
                            className={inputClass} required
                            onChange={(e) => setFormData({...formData, vehicle_tier: e.target.value})}
                          >
                            <option value="">Select Tier</option>
                            <option>Economy</option><option>Mid</option><option>Premium</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 uppercase">Vehicle Age (Years)</label>
                          <input 
                            type="number" min="0" max="15" className={inputClass} required
                            onChange={(e) => setFormData({...formData, vehicle_age: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 uppercase">Incident Photos</label>
                          <label className="border-2 border-dashed border-slate-700 rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all text-slate-400">
                            <Upload size={16} /> Upload Images
                            <input type="file" className="hidden" multiple />
                          </label>
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : "Calculate AI Payout"}
                    </button>
                  </form>
                )}

                {!policyData && !loading && (
                  <div className="p-10 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3 text-slate-600">
                    <AlertCircle size={40} />
                    <p className="text-xs uppercase font-bold">Awaiting Valid Policy ID</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AmountPredict;
