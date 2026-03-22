import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  // States
  const [policyId, setPolicyId] = useState("");
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [predictedAmount, setPredictedAmount] = useState(0);

  const [formData, setFormData] = useState({
    medical_history: "",
    age: "",
    vehicle_type: "",
    vehicle_tier: "",
    vehicle_age: "",
    images: null
  });

  // ✅ Protect route
  useEffect(() => {
    if (!location.state?.autoApproved) {
      navigate("/customer/predict");
    }
  }, []);

  /**
   * 🔍 POLICY LOOKUP
   */
  const handleLookup = async () => {
    if (!policyId) return;

    setLoading(true);
    try {
      const res = await API.get(`/customer/policy-details/${policyId}`);
      if (res.data) {
        setPolicyData(res.data);
        toast.success(`Policy Found: ${res.data.plan_type} Insurance`);
      }
    } catch (err) {
      toast.error("Policy ID not found");
      setPolicyData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ FIXED PREDICT FUNCTION
   */
  const handlePredict = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!policyId) {
        toast.error("Policy ID missing");
        return;
      }

      const payload = {
        policy_id: policyId,
        customer_id: localStorage.getItem("customer_id"),

        // ✅ REQUIRED FIELD
        claim_amount: Number(location.state?.claimAmount || 10000),

        // ✅ Minimal backend-compatible field
        age: Number(formData.age || 30)
      };

      const res = await API.post("/calculate-payout", payload);

      setPredictedAmount(res.data.amount);
      setShowSuccess(true);
      triggerConfetti();

      setTimeout(() => navigate("/customer/claim-policies"), 6000);

    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const inputClass =
    "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white font-mono">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />

        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-2xl">

            {showSuccess ? (
              <div className="text-center space-y-6 py-20">
                <CheckCircle size={80} className="mx-auto text-emerald-400" />
                <h1 className="text-5xl font-black uppercase">Congratulations!</h1>
                <p className="text-xl text-emerald-400">
                  Claimable amount: ₹{predictedAmount}
                </p>
              </div>
            ) : (
              <div className="bg-[#111e32] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-blue-400" /> Payout Estimator
                </h2>

                {/* POLICY SEARCH */}
                <div className="flex gap-2 mb-6">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="Policy ID"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                  />
                  <button onClick={handleLookup} className="bg-blue-600 px-4 rounded">
                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                  </button>
                </div>

                {policyData && (
                  <form onSubmit={handlePredict} className="space-y-4">

                    {/* HEALTH */}
                    {policyData.plan_type === "Health" && (
                      <>
                        <input
                          type="number"
                          placeholder="Age"
                          className={inputClass}
                          onChange={(e) =>
                            setFormData({ ...formData, age: e.target.value })
                          }
                        />
                        <textarea
                          placeholder="Medical History"
                          className={inputClass}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              medical_history: e.target.value
                            })
                          }
                        />
                      </>
                    )}

                    {/* AUTO */}
                    {policyData.plan_type === "Auto" && (
                      <>
                        <select
                          className={inputClass}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicle_type: e.target.value
                            })
                          }
                        >
                          <option>Car</option>
                          <option>Bike</option>
                        </select>

                        <input
                          type="file"
                          multiple
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              images: e.target.files
                            })
                          }
                        />
                      </>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 py-3 rounded"
                    >
                      {submitting ? "Processing..." : "Calculate Payout"}
                    </button>
                  </form>
                )}

                {!policyData && (
                  <div className="text-center text-gray-400">
                    Enter valid Policy ID
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
