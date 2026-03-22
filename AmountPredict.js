import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { CheckCircle, ShieldCheck, Search, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

function AmountPredict() {
  const navigate = useNavigate();
  const location = useLocation();

  const [policyId, setPolicyId] = useState("");
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [predictedAmount, setPredictedAmount] = useState(0);

  const [formData, setFormData] = useState({
    // HEALTH
    age: "",
    prior_claims_count: "",
    incident_severity: "",
    region_risk_level: "",
    bmi: "",
    bloodpressure: "",
    diabetes: "",
    hereditary_diseases: "",
    smoker: "",
    regular_ex: "",
    weight: "",
    health_risk_score: "",
    policy_coverage_details: "",
    payment_frequency: "",
    gender: "",

    // AUTO
    vehicle_type: "",
    vehicle_tier: "",
    vehicle_subtype: "",
    images: null
  });

  useEffect(() => {
    if (!location.state?.autoApproved) {
      navigate("/customer/predict");
    }
  }, []);

  // 🔍 POLICY LOOKUP
  const handleLookup = async () => {
    if (!policyId) return;

    setLoading(true);
    try {
      const res = await API.get(`/customer/policy-details/${policyId}`);
      setPolicyData(res.data);
      toast.success(`Policy Found: ${res.data.plan_type}`);
    } catch {
      toast.error("Policy not found");
      setPolicyData(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 PREDICT
  const handlePredict = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let payload = {
        policy_id: policyId,
        customer_id: localStorage.getItem("customer_id"),
        total_claim_amount: policyData.total_claim_amount
      };

      let res;

      if (policyData.plan_type === "Health") {
        payload = {
          ...payload,
          age: Number(formData.age),
          prior_claims_count: Number(formData.prior_claims_count),
          incident_severity: formData.incident_severity,
          region_risk_level: formData.region_risk_level,
          bmi: Number(formData.bmi),
          bloodpressure: Number(formData.bloodpressure),
          diabetes: Number(formData.diabetes),
          hereditary_diseases: formData.hereditary_diseases,
          smoker: Number(formData.smoker),
          regular_ex: Number(formData.regular_ex),
          weight: Number(formData.weight),
          health_risk_score: Number(formData.health_risk_score),
          policy_coverage_details: formData.policy_coverage_details,
          payment_frequency: formData.payment_frequency,
          gender: formData.gender
        };

        res = await API.post("/predict-health", payload);

      } else {
        payload = {
          ...payload,
          vehicle_type: formData.vehicle_type,
          vehicle_tier: formData.vehicle_tier,
          vehicle_subtype: formData.vehicle_subtype
        };

        res = await API.post("/predict-auto", payload);
      }

      setPredictedAmount(res.data.amount);
      setShowSuccess(true);

      confetti({ particleCount: 150, spread: 70 });

      setTimeout(() => {
        navigate("/customer/claim-policies");
      }, 4000);

    } catch (err) {
      console.error(err);
      toast.error("Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "bg-[#1e293b]/50 border border-slate-700 text-white p-3 rounded";

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1">
        <CustNavbar />

        <main className="p-8 flex justify-center">
          <div className="w-full max-w-2xl">

            {showSuccess ? (
              <div className="text-center py-20">
                <CheckCircle size={80} className="mx-auto text-green-400" />
                <h1 className="text-3xl font-bold mt-4">Success</h1>
                <p className="text-xl mt-2">
                  Claimable Amount: ₹{predictedAmount}
                </p>
              </div>
            ) : (
              <div className="bg-[#111e32] p-8 rounded-xl">

                <h2 className="text-xl mb-6 flex gap-2">
                  <ShieldCheck /> Payout Estimator
                </h2>

                {/* POLICY SEARCH */}
                <div className="flex gap-2 mb-6">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="Enter Policy ID (e.g., PL-PLA-8533)"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                  />
                  <button onClick={handleLookup} className="bg-blue-600 px-4 rounded">
                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                  </button>
                </div>

                {/* POLICY DETAILS */}
                {policyData && (
                  <div className="bg-slate-800 p-4 rounded mb-4">
                    <p>Premium: ₹{policyData.premium}</p>
                    <p>Sum Assured: ₹{policyData.sum_assured}</p>
                    <p>Tenure: {policyData.tenure} years</p>
                    <p>Plan Type: {policyData.plan_type}</p>
                  </div>
                )}

                {policyData && (
                  <form onSubmit={handlePredict} className="space-y-3">

                    {/* HEALTH FORM */}
                    {policyData.plan_type === "Health" && (
                      <>
                        <input className={inputClass} placeholder="Age (e.g., 41)"
                          onChange={(e)=>setFormData({...formData, age:e.target.value})} />

                        <input className={inputClass} placeholder="Prior Claims (e.g., 0)"
                          onChange={(e)=>setFormData({...formData, prior_claims_count:e.target.value})} />

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, incident_severity:e.target.value})}>
                          <option value="">Incident Severity</option>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, region_risk_level:e.target.value})}>
                          <option value="">Region Risk</option>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>

                        <input className={inputClass} placeholder="BMI (e.g., 24.6)"
                          onChange={(e)=>setFormData({...formData, bmi:e.target.value})} />

                        <input className={inputClass} placeholder="Blood Pressure (e.g., 120)"
                          onChange={(e)=>setFormData({...formData, bloodpressure:e.target.value})} />

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, diabetes:e.target.value})}>
                          <option value="">Diabetes</option>
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>

                        <input className={inputClass} placeholder="Hereditary Diseases (e.g., NoDisease)"
                          onChange={(e)=>setFormData({...formData, hereditary_diseases:e.target.value})} />

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, smoker:e.target.value})}>
                          <option value="">Smoker</option>
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, regular_ex:e.target.value})}>
                          <option value="">Exercise</option>
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>

                        <input className={inputClass} placeholder="Weight (kg)"
                          onChange={(e)=>setFormData({...formData, weight:e.target.value})} />

                        <input className={inputClass} placeholder="Health Risk Score (e.g., 1)"
                          onChange={(e)=>setFormData({...formData, health_risk_score:e.target.value})} />

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, policy_coverage_details:e.target.value})}>
                          <option value="">Coverage</option>
                          <option>Individual</option>
                          <option>Family</option>
                        </select>

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, payment_frequency:e.target.value})}>
                          <option value="">Payment Frequency</option>
                          <option>Annual</option>
                          <option>Monthly</option>
                        </select>

                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, gender:e.target.value})}>
                          <option value="">Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </>
                    )}

                    {/* AUTO FORM */}
                    {policyData.plan_type === "Auto" && (
                      <>
                        <select className={inputClass}
                          onChange={(e)=>setFormData({...formData, vehicle_type:e.target.value})}>
                          <option value="">Vehicle Type</option>
                          <option>Car</option>
                          <option>Bike</option>
                        </select>

                        <input className={inputClass} placeholder="Vehicle Tier"
                          onChange={(e)=>setFormData({...formData, vehicle_tier:e.target.value})} />

                        <input className={inputClass} placeholder="Vehicle Subtype"
                          onChange={(e)=>setFormData({...formData, vehicle_subtype:e.target.value})} />

                        <input type="file" multiple
                          onChange={(e)=>setFormData({...formData, images:e.target.files})} />
                      </>
                    )}

                    <button className="w-full bg-green-600 py-3 rounded">
                      {submitting ? "Processing..." : "Predict Claim"}
                    </button>

                  </form>
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
