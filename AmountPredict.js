import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import {
  CheckCircle,
  Loader2,
  Search,
  HeartPulse,
  ShieldCheck,
  Calculator,
  Info
} from "lucide-react";
import { toast } from "react-toastify";
 
function AmountPredict() {
  const navigate = useNavigate();
 
  const [policyIdInput, setPolicyIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [predictedAmount, setPredictedAmount] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
 
  const [formData, setFormData] = useState({
    policy_id: "",
    age: "",
    policy_tenure_years: "",     // ✅ fetched from DB
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
    sum_assured: "",             // ✅ fetched from DB
    annual_premium: "",          // ✅ fetched from DB
    payment_frequency: "",
    gender: ""
  });
 
  const inputClass =
    "w-full bg-[#0a0f1a] border border-slate-800 p-2.5 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner";
 
  const labelClass =
    "text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider";
 
  // --------------------------------------------------
  // FETCH POLICY DETAILS (ONLY 3 FIELDS)
  // --------------------------------------------------
  const handleLookup = async () => {
    if (!policyIdInput) return toast.error("Enter Policy ID");
    setLoading(true);
 
    try {
      const res = await API.get(`/customer/policy-details/${policyIdInput}`);
      const data = res.data;
 
      const fetchedSumAssured =
        data.sum_assured ??
        data.total_claim_amount ??
        data.coverage_amount ??
        0;
 
      const fetchedPremium =
        data.annual_premium ??
        data.premium_amount ??
        data.premium ??
        0;
 
      setFormData(prev => ({
        ...prev,
        policy_id: policyIdInput,
        policy_tenure_years: Number(data.tenure ?? 0),
        sum_assured: Number(fetchedSumAssured),
        annual_premium: Number(fetchedPremium)
      }));
 
      setIsFetched(true);
      toast.success("Policy details loaded");
    } catch (err) {
      toast.error("Policy not found");
    } finally {
      setLoading(false);
    }
  };
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  // ✅ validate ONLY user-entered fields
  const validateForm = () => {
    const requiredFields = [
      "age",
      "prior_claims_count",
      "incident_severity",
      "region_risk_level",
      "bmi",
      "bloodpressure",
      "diabetes",
      "smoker",
      "regular_ex",
      "weight",
      "health_risk_score",
      "hereditary_diseases",
      "policy_coverage_details",
      "payment_frequency",
      "gender"
    ];
 
    for (let field of requiredFields) {
      if (formData[field] === "" || formData[field] === null) {
        return false;
      }
    }
    return true;
  };
 
  // --------------------------------------------------
  // PREDICT
  // --------------------------------------------------
  const handlePredict = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Please fill all required fields");
 
    setSubmitting(true);
 
    try {
      const payload = {
        policy_id: String(formData.policy_id),
        age: parseInt(formData.age),
        policy_tenure_years: parseFloat(formData.policy_tenure_years),
        prior_claims_count: parseInt(formData.prior_claims_count),
        incident_severity: formData.incident_severity,
        region_risk_level: formData.region_risk_level,
        bmi: parseFloat(formData.bmi),
        bloodpressure: parseInt(formData.bloodpressure),
        diabetes: Number(formData.diabetes),
        smoker: Number(formData.smoker),
        regular_ex: Number(formData.regular_ex),
        hereditary_diseases: formData.hereditary_diseases,
        weight: parseInt(formData.weight),
        health_risk_score: parseInt(formData.health_risk_score),
        policy_coverage_details: formData.policy_coverage_details,
        payment_frequency: formData.payment_frequency,
        gender: formData.gender
      };
 
      const res = await API.post("/predict-health", payload);
 
      setPredictedAmount(res.data.claimable_amount);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
 
      setTimeout(() => navigate("/customer/claim-policies"), 5000);
    } catch (err) {
      toast.error("Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col">
        <CustNavbar />
 
        <main className="p-8">
          <div className="max-w-5xl mx-auto">
 
            {predictedAmount !== null ? (
              <div className="text-center py-20">
                <CheckCircle size={80} className="mx-auto text-green-400 mb-6" />
                <h1 className="text-4xl font-black">Prediction Successful</h1>
                <h2 className="text-7xl mt-6">₹{predictedAmount.toLocaleString()}</h2>
              </div>
            ) : (
              <>
                {/* POLICY LOOKUP */}
                <div className="bg-[#111e32] p-6 rounded-3xl mb-6">
                  <label className={labelClass}>Enter Policy ID</label>
                  <div className="flex gap-4">
                    <input
                      className={inputClass}
                      value={policyIdInput}
                      onChange={(e) => setPolicyIdInput(e.target.value)}
                      placeholder="Policy ID"
                    />
                    <button onClick={handleLookup} className="bg-blue-600 px-8 rounded-xl">
                      {loading ? <Loader2 className="animate-spin" /> : "Fetch"}
                    </button>
                  </div>
                </div>
 
                {isFetched && (
                  <form onSubmit={handlePredict} className="space-y-6">
 
                    {/* READ ONLY FROM DB */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input className={inputClass} value={`Tenure: ${formData.policy_tenure_years} yrs`} readOnly />
                      <input className={inputClass} value={`Sum Assured: ₹${formData.sum_assured.toLocaleString()}`} readOnly />
                      <input className={inputClass} value={`Annual Premium: ₹${formData.annual_premium.toLocaleString()}`} readOnly />
                    </div>
 
                    {/* USER INPUTS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input name="age" placeholder="Age" className={inputClass} onChange={handleChange} />
                      <input name="weight" placeholder="Weight (kg)" className={inputClass} onChange={handleChange} />
                      <input name="bmi" placeholder="BMI" className={inputClass} onChange={handleChange} />
                      <input name="bloodpressure" placeholder="Blood Pressure" className={inputClass} onChange={handleChange} />
                      <input name="prior_claims_count" placeholder="Prior Claims" className={inputClass} onChange={handleChange} />
 
                      <select name="diabetes" className={inputClass} onChange={handleChange}>
                        <option value="">Diabetes?</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
 
                      <select name="smoker" className={inputClass} onChange={handleChange}>
                        <option value="">Smoker?</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
 
                      <select name="regular_ex" className={inputClass} onChange={handleChange}>
                        <option value="">Exercise</option>
                        <option value="1">Regular</option>
                        <option value="0">Sedentary</option>
                      </select>
 
                      <input name="health_risk_score" placeholder="Health Risk Score" className={inputClass} onChange={handleChange} />
 
                      <input name="hereditary_diseases" placeholder="Hereditary Diseases" className={inputClass} onChange={handleChange} />
 
                      <select name="incident_severity" className={inputClass} onChange={handleChange}>
                        <option value="">Incident Severity</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
 
                      <select name="region_risk_level" className={inputClass} onChange={handleChange}>
                        <option value="">Region Risk</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
 
                      <select name="policy_coverage_details" className={inputClass} onChange={handleChange}>
                        <option value="">Coverage Type</option>
                        <option value="Individual">Individual</option>
                        <option value="Family">Family</option>
                      </select>
 
                      <select name="payment_frequency" className={inputClass} onChange={handleChange}>
                        <option value="">Payment Frequency</option>
                        <option value="Annual">Annual</option>
                        <option value="Monthly">Monthly</option>
                      </select>
 
                      <select name="gender" className={inputClass} onChange={handleChange}>
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
 
                    <button className="w-full bg-green-600 py-4 rounded-xl font-bold">
                      {submitting ? "Predicting..." : "Predict Claim Amount"}
                    </button>
 
                  </form>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
 
export default AmountPredict;
