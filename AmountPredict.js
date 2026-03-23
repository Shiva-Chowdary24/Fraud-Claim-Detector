// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import confetti from "canvas-confetti";
// import CustSidebar from "../components/CustSidebar";
// import CustNavbar from "../components/CustNavbar";
// import API from "../services/api";
// import { Loader2, CheckCircle } from "lucide-react";
// import { toast } from "react-toastify";
 
// function AmountPredict() {
//   const navigate = useNavigate();
 
//   const [policyIdInput, setPolicyIdInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [predictedAmount, setPredictedAmount] = useState(null);
//   const [isFetched, setIsFetched] = useState(false);
 
//   const [formData, setFormData] = useState({
//     policy_id: "",
//     age: "",
//     policy_tenure_years: "",
//     prior_claims_count: "",
//     incident_severity: "",
//     region_risk_level: "",
//     bmi: "",
//     bloodpressure: "",
//     diabetes: "",
//     hereditary_diseases: "",
//     smoker: "",
//     regular_ex: "",
//     weight: "",
//     health_risk_score: "",
//     policy_coverage_details: "",
//     sum_assured: "",
//     annual_premium: "",
//     payment_frequency: "",
//     gender: ""
//   });
 
//   const input =
//     "w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none";
 
//   /* ================= FETCH POLICY ================= */
//   const handleLookup = async () => {
//     if (!policyIdInput) return toast.error("Enter Policy ID");
//     setLoading(true);
//     try {
//       const res = await API.get(`/customer/policy-details/${policyIdInput}`);
//       const d = res.data;
 
//       setFormData(prev => ({
//         ...prev,
//         policy_id: policyIdInput,
//         policy_tenure_years: d.tenure || 0,
//         sum_assured: d.sum_assured || 0,
//         annual_premium: d.annual_premium || 0
//       }));
 
//       setIsFetched(true);
//       toast.success("Policy loaded");
//     } catch {
//       toast.error("Policy not found");
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   const handleChange = e =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });
 
//   /* ================= PREDICT ================= */
//   const handlePredict = async e => {
//     e.preventDefault();
//     setSubmitting(true);
 
//     try {
//       const res = await API.post("/predict-health", {
//         ...formData,
//         age: Number(formData.age),
//         weight: Number(formData.weight),
//         bmi: Number(formData.bmi),
//         bloodpressure: Number(formData.bloodpressure),
//         prior_claims_count: Number(formData.prior_claims_count),
//         diabetes: Number(formData.diabetes),
//         smoker: Number(formData.smoker),
//         regular_ex: Number(formData.regular_ex),
//         health_risk_score: Number(formData.health_risk_score),
//         sum_assured: Number(formData.sum_assured),
//         annual_premium: Number(formData.annual_premium)
//       });
 
//       if (res.data.approved === "Yes") {
//         setPredictedAmount(res.data.claimable_amount);
//         confetti({ particleCount: 150, spread: 70 });
//         setTimeout(() => navigate("/customer/claim-policies"), 5000);
//       } else {
//         res.data.rejection_reasons.forEach(r => toast.error(r));
//       }
//     } catch {
//       toast.error("Prediction failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };
 
//   return (
//     <div className="flex min-h-screen bg-[#050b18] text-white">
//       <CustSidebar />
//       <div className="flex-1 flex flex-col">
//         <CustNavbar />
 
//         <main className="p-8 max-w-6xl mx-auto w-full">
//           {predictedAmount !== null ? (
//             <div className="text-center py-20">
//               <CheckCircle size={64} className="mx-auto text-green-400" />
//               <p className="text-5xl font-bold mt-6">
//                 ₹{predictedAmount.toLocaleString()}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* POLICY SEARCH */}
//               <div className="flex gap-4 mb-6">
//                 <input
//                   className={input}
//                   placeholder="PL-PLA-8533"
//                   value={policyIdInput}
//                   onChange={e => setPolicyIdInput(e.target.value)}
//                 />
//                 <button
//                   onClick={handleLookup}
//                   className="bg-blue-600 px-8 rounded-xl font-semibold"
//                 >
//                   {loading ? <Loader2 className="animate-spin" /> : "Fetch"}
//                 </button>
//               </div>
 
//               {isFetched && (
//                 <form onSubmit={handlePredict}>
//                   {/* READ ONLY */}
//                   <div className="grid grid-cols-3 gap-4 mb-4">
//                     <input className={input} readOnly value={`Tenure: ${formData.policy_tenure_years} yrs`} />
//                     <input className={input} readOnly value={`Sum Assured: ₹${formData.sum_assured}`} />
//                     <input className={input} readOnly value={`Annual Premium: ₹${formData.annual_premium}`} />
//                   </div>
 
//                   {/* INPUT GRID */}
//                   <div className="grid grid-cols-3 gap-4">
//                     <input name="age" onChange={handleChange} placeholder="Age" className={input} />
//                     <input name="weight" onChange={handleChange} placeholder="Weight" className={input} />
//                     <input name="bmi" onChange={handleChange} placeholder="BMI" className={input} />
 
//                     <input name="bloodpressure" onChange={handleChange} placeholder="BP" className={input} />
//                     <input name="prior_claims_count" onChange={handleChange} placeholder="Prior Claims" className={input} />
//                     <select name="diabetes" onChange={handleChange} className={input}>
//                       <option value="">Diabetes</option>
//                       <option value="1">Yes</option>
//                       <option value="0">No</option>
//                     </select>
 
//                     <select name="smoker" onChange={handleChange} className={input}>
//                       <option value="">Smoker</option>
//                       <option value="1">Yes</option>
//                       <option value="0">No</option>
//                     </select>
//                     <select name="regular_ex" onChange={handleChange} className={input}>
//                       <option value="">Exercise</option>
//                       <option value="1">Regular</option>
//                       <option value="0">No</option>
//                     </select>
//                     <input name="health_risk_score" onChange={handleChange} placeholder="Risk Score" className={input} />
 
//                     <input name="hereditary_diseases" onChange={handleChange} placeholder="Hereditary" className={input} />
//                     <select name="incident_severity" onChange={handleChange} className={input}>
//                       <option value="">Severity</option>
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                     </select>
//                     <select name="region_risk_level" onChange={handleChange} className={input}>
//                       <option value="">Region Risk</option>
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                     </select>
 
//                     <select name="policy_coverage_details" onChange={handleChange} className={input}>
//                       <option value="">Coverage</option>
//                       <option value="Individual">Individual</option>
//                       <option value="Family">Family</option>
//                     </select>
//                     <select name="payment_frequency" onChange={handleChange} className={input}>
//                       <option value="">Frequency</option>
//                       <option value="Annual">Annual</option>
//                       <option value="Monthly">Monthly</option>
//                     </select>
//                     <select name="gender" onChange={handleChange} className={input}>
//                       <option value="">Gender</option>
//                       <option value="Male">Male</option>
//                       <option value="Female">Female</option>
//                     </select>
//                   </div>
 
//                   <button className="mt-6 w-full bg-green-600 py-4 rounded-xl font-bold">
//                     {submitting ? <Loader2 className="animate-spin" /> : "Predict Claim Amount"}
//                   </button>
//                 </form>
//               )}
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }
 
// export default AmountPredict;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
 
function AmountPredict() {
  const navigate = useNavigate();
 
  const [policyIdInput, setPolicyIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [predictedAmount, setPredictedAmount] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
 
  // ✅ Exact Schema for Backend
  const [formData, setFormData] = useState({
    policy_id: "",
    age: "",
    policy_tenure_years: "",
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
    sum_assured: "",
    annual_premium: "",
    payment_frequency: "",
    gender: ""
  });
 
  const input =
    "w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none";
 
  /* =====================================================
     🔍 FETCH POLICY DETAILS (✅ FIXED PREMIUM MAPPING)
     ===================================================== */
  const handleLookup = async () => {
    if (!policyIdInput) return toast.error("Enter Policy ID");
 
    setLoading(true);
    try {
      const res = await API.get(`/customer/policy-details/${policyIdInput}`);
      const d = res.data;
 
      // ✅ Robust fallback mapping
      const fetchedPremium =
        d.annual_premium ??
        d.premium_amount ??
        d.premium ??
        0;
 
      const fetchedSumAssured =
        d.sum_assured ??
        d.coverage_amount ??
        d.total_claim_amount ??
        0;
 
      setFormData(prev => ({
        ...prev,
        policy_id: policyIdInput,
        policy_tenure_years: Number(d.tenure ?? 0),
        sum_assured: Number(fetchedSumAssured),
        annual_premium: Number(fetchedPremium)
      }));
 
      setIsFetched(true);
      toast.success("Policy details loaded");
    } catch {
      toast.error("Policy not found");
    } finally {
      setLoading(false);
    }
  };
 
  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
 
  /* =====================================================
     🔮 PREDICT CLAIM AMOUNT
     ===================================================== */
  const handlePredict = async e => {
    e.preventDefault();
    setSubmitting(true);
 
    try {
      const res = await API.post("/predict-health", {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        bmi: Number(formData.bmi),
        bloodpressure: Number(formData.bloodpressure),
        prior_claims_count: Number(formData.prior_claims_count),
        diabetes: Number(formData.diabetes),
        smoker: Number(formData.smoker),
        regular_ex: Number(formData.regular_ex),
        health_risk_score: Number(formData.health_risk_score),
        sum_assured: Number(formData.sum_assured),
        annual_premium: Number(formData.annual_premium)
      });
 
      if (res.data.approved === "Yes") {
        setPredictedAmount(res.data.claimable_amount);
        confetti({ particleCount: 150, spread: 70 });
        setTimeout(() => navigate("/customer/claim-policies"), 5000);
      } else {
        (res.data.rejection_reasons || ["Claim rejected"])
          .forEach(r => toast.error(r));
      }
    } catch {
      toast.error("Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };
 
  /* =====================================================
     🖥 UI (MATCHES YOUR SCREENSHOT)
     ===================================================== */
  return (
    <div className="flex min-h-screen bg-[#050b18] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col">
        <CustNavbar />
 
        <main className="p-8 max-w-6xl mx-auto w-full">
          {predictedAmount !== null ? (
            <div className="text-center py-20">
              <CheckCircle size={64} className="mx-auto text-green-400" />
              <p className="text-5xl font-bold mt-6">
                ₹{predictedAmount.toLocaleString()}
              </p>
            </div>
          ) : (
            <>
              {/* POLICY SEARCH */}
              <div className="flex gap-4 mb-6">
                <input
                  className={input}
                  placeholder="PL-PLA-8533"
                  value={policyIdInput}
                  onChange={e => setPolicyIdInput(e.target.value)}
                />
                <button
                  onClick={handleLookup}
                  className="bg-blue-600 px-8 rounded-xl font-semibold"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Fetch"}
                </button>
              </div>
 
              {isFetched && (
                <form onSubmit={handlePredict}>
                  {/* READ ONLY CONTRACT DATA */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <input className={input} readOnly value={`Tenure: ${formData.policy_tenure_years} yrs`} />
                    <input className={input} readOnly value={`Sum Assured: ₹${formData.sum_assured}`} />
                    <input className={input} readOnly value={`Annual Premium: ₹${formData.annual_premium}`} />
                  </div>
 
                  {/* INPUT GRID */}
                  <div className="grid grid-cols-3 gap-4">
                    <input name="age" onChange={handleChange} placeholder="Age" className={input} />
                    <input name="weight" onChange={handleChange} placeholder="Weight" className={input} />
                    <input name="bmi" onChange={handleChange} placeholder="BMI" className={input} />
 
                    <input name="bloodpressure" onChange={handleChange} placeholder="BP" className={input} />
                    <input name="prior_claims_count" onChange={handleChange} placeholder="Prior Claims" className={input} />
                    <select name="diabetes" onChange={handleChange} className={input}>
                      <option value="">Diabetes</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
 
                    <select name="smoker" onChange={handleChange} className={input}>
                      <option value="">Smoker</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                    <select name="regular_ex" onChange={handleChange} className={input}>
                      <option value="">Exercise</option>
                      <option value="1">Regular</option>
                      <option value="0">No</option>
                    </select>
                    <input name="health_risk_score" onChange={handleChange} placeholder="Risk Score" className={input} />
 
                    <input name="hereditary_diseases" onChange={handleChange} placeholder="Hereditary" className={input} />
                    <select name="incident_severity" onChange={handleChange} className={input}>
                      <option value="">Severity</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <select name="region_risk_level" onChange={handleChange} className={input}>
                      <option value="">Region Risk</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
 
                    <select name="policy_coverage_details" onChange={handleChange} className={input}>
                      <option value="">Coverage</option>
                      <option value="Individual">Individual</option>
                      <option value="Family">Family</option>
                    </select>
                    <select name="payment_frequency" onChange={handleChange} className={input}>
                      <option value="">Frequency</option>
                      <option value="Annual">Annual</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                    <select name="gender" onChange={handleChange} className={input}>
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
 
                  <button className="mt-6 w-full bg-green-600 py-4 rounded-xl font-bold">
                    {submitting ? <Loader2 className="animate-spin" /> : "Predict Claim Amount"}
                  </button>
                </form>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
 
export default AmountPredict;
