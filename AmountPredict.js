// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import confetti from "canvas-confetti";
// // import CustSidebar from "../components/CustSidebar";
// // import CustNavbar from "../components/CustNavbar";
// // import API from "../services/api";
// // import { Loader2, CheckCircle } from "lucide-react";
// // import { toast } from "react-toastify";
 
// // function AmountPredict() {
// //   const navigate = useNavigate();
 
// //   const [policyIdInput, setPolicyIdInput] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [predictedAmount, setPredictedAmount] = useState(null);
// //   const [isFetched, setIsFetched] = useState(false);
 
// //   const [formData, setFormData] = useState({
// //     policy_id: "",
// //     age: "",
// //     policy_tenure_years: "",
// //     prior_claims_count: "",
// //     incident_severity: "",
// //     region_risk_level: "",
// //     bmi: "",
// //     bloodpressure: "",
// //     diabetes: "",
// //     hereditary_diseases: "",
// //     smoker: "",
// //     regular_ex: "",
// //     weight: "",
// //     health_risk_score: "",
// //     policy_coverage_details: "",
// //     sum_assured: "",
// //     annual_premium: "",
// //     payment_frequency: "",
// //     gender: ""
// //   });
 
// //   const input =
// //     "w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none";
 
// //   /* ================= FETCH POLICY ================= */
// //   const handleLookup = async () => {
// //     if (!policyIdInput) return toast.error("Enter Policy ID");
// //     setLoading(true);
// //     try {
// //       const res = await API.get(`/customer/policy-details/${policyIdInput}`);
// //       const d = res.data;
 
// //       setFormData(prev => ({
// //         ...prev,
// //         policy_id: policyIdInput,
// //         policy_tenure_years: d.tenure || 0,
// //         sum_assured: d.sum_assured || 0,
// //         annual_premium: d.annual_premium || 0
// //       }));
 
// //       setIsFetched(true);
// //       toast.success("Policy loaded");
// //     } catch {
// //       toast.error("Policy not found");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
 
// //   const handleChange = e =>
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
 
// //   /* ================= PREDICT ================= */
// //   const handlePredict = async e => {
// //     e.preventDefault();
// //     setSubmitting(true);
 
// //     try {
// //       const res = await API.post("/predict-health", {
// //         ...formData,
// //         age: Number(formData.age),
// //         weight: Number(formData.weight),
// //         bmi: Number(formData.bmi),
// //         bloodpressure: Number(formData.bloodpressure),
// //         prior_claims_count: Number(formData.prior_claims_count),
// //         diabetes: Number(formData.diabetes),
// //         smoker: Number(formData.smoker),
// //         regular_ex: Number(formData.regular_ex),
// //         health_risk_score: Number(formData.health_risk_score),
// //         sum_assured: Number(formData.sum_assured),
// //         annual_premium: Number(formData.annual_premium)
// //       });
 
// //       if (res.data.approved === "Yes") {
// //         setPredictedAmount(res.data.claimable_amount);
// //         confetti({ particleCount: 150, spread: 70 });
// //         setTimeout(() => navigate("/customer/claim-policies"), 5000);
// //       } else {
// //         res.data.rejection_reasons.forEach(r => toast.error(r));
// //       }
// //     } catch {
// //       toast.error("Prediction failed");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };
 
// //   return (
// //     <div className="flex min-h-screen bg-[#050b18] text-white">
// //       <CustSidebar />
// //       <div className="flex-1 flex flex-col">
// //         <CustNavbar />
 
// //         <main className="p-8 max-w-6xl mx-auto w-full">
// //           {predictedAmount !== null ? (
// //             <div className="text-center py-20">
// //               <CheckCircle size={64} className="mx-auto text-green-400" />
// //               <p className="text-5xl font-bold mt-6">
// //                 ₹{predictedAmount.toLocaleString()}
// //               </p>
// //             </div>
// //           ) : (
// //             <>
// //               {/* POLICY SEARCH */}
// //               <div className="flex gap-4 mb-6">
// //                 <input
// //                   className={input}
// //                   placeholder="PL-PLA-8533"
// //                   value={policyIdInput}
// //                   onChange={e => setPolicyIdInput(e.target.value)}
// //                 />
// //                 <button
// //                   onClick={handleLookup}
// //                   className="bg-blue-600 px-8 rounded-xl font-semibold"
// //                 >
// //                   {loading ? <Loader2 className="animate-spin" /> : "Fetch"}
// //                 </button>
// //               </div>
 
// //               {isFetched && (
// //                 <form onSubmit={handlePredict}>
// //                   {/* READ ONLY */}
// //                   <div className="grid grid-cols-3 gap-4 mb-4">
// //                     <input className={input} readOnly value={`Tenure: ${formData.policy_tenure_years} yrs`} />
// //                     <input className={input} readOnly value={`Sum Assured: ₹${formData.sum_assured}`} />
// //                     <input className={input} readOnly value={`Annual Premium: ₹${formData.annual_premium}`} />
// //                   </div>
 
// //                   {/* INPUT GRID */}
// //                   <div className="grid grid-cols-3 gap-4">
// //                     <input name="age" onChange={handleChange} placeholder="Age" className={input} />
// //                     <input name="weight" onChange={handleChange} placeholder="Weight" className={input} />
// //                     <input name="bmi" onChange={handleChange} placeholder="BMI" className={input} />
 
// //                     <input name="bloodpressure" onChange={handleChange} placeholder="BP" className={input} />
// //                     <input name="prior_claims_count" onChange={handleChange} placeholder="Prior Claims" className={input} />
// //                     <select name="diabetes" onChange={handleChange} className={input}>
// //                       <option value="">Diabetes</option>
// //                       <option value="1">Yes</option>
// //                       <option value="0">No</option>
// //                     </select>
 
// //                     <select name="smoker" onChange={handleChange} className={input}>
// //                       <option value="">Smoker</option>
// //                       <option value="1">Yes</option>
// //                       <option value="0">No</option>
// //                     </select>
// //                     <select name="regular_ex" onChange={handleChange} className={input}>
// //                       <option value="">Exercise</option>
// //                       <option value="1">Regular</option>
// //                       <option value="0">No</option>
// //                     </select>
// //                     <input name="health_risk_score" onChange={handleChange} placeholder="Risk Score" className={input} />
 
// //                     <input name="hereditary_diseases" onChange={handleChange} placeholder="Hereditary" className={input} />
// //                     <select name="incident_severity" onChange={handleChange} className={input}>
// //                       <option value="">Severity</option>
// //                       <option value="Low">Low</option>
// //                       <option value="Medium">Medium</option>
// //                       <option value="High">High</option>
// //                     </select>
// //                     <select name="region_risk_level" onChange={handleChange} className={input}>
// //                       <option value="">Region Risk</option>
// //                       <option value="Low">Low</option>
// //                       <option value="Medium">Medium</option>
// //                       <option value="High">High</option>
// //                     </select>
 
// //                     <select name="policy_coverage_details" onChange={handleChange} className={input}>
// //                       <option value="">Coverage</option>
// //                       <option value="Individual">Individual</option>
// //                       <option value="Family">Family</option>
// //                     </select>
// //                     <select name="payment_frequency" onChange={handleChange} className={input}>
// //                       <option value="">Frequency</option>
// //                       <option value="Annual">Annual</option>
// //                       <option value="Monthly">Monthly</option>
// //                     </select>
// //                     <select name="gender" onChange={handleChange} className={input}>
// //                       <option value="">Gender</option>
// //                       <option value="Male">Male</option>
// //                       <option value="Female">Female</option>
// //                     </select>
// //                   </div>
 
// //                   <button className="mt-6 w-full bg-green-600 py-4 rounded-xl font-bold">
// //                     {submitting ? <Loader2 className="animate-spin" /> : "Predict Claim Amount"}
// //                   </button>
// //                 </form>
// //               )}
// //             </>
// //           )}
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }
 
// // export default AmountPredict;
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
 
//   // ✅ Exact Schema for Backend
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
 
//   /* =====================================================
//      🔍 FETCH POLICY DETAILS (✅ FIXED PREMIUM MAPPING)
//      ===================================================== */
//   const handleLookup = async () => {
//     if (!policyIdInput) return toast.error("Enter Policy ID");
 
//     setLoading(true);
//     try {
//       const res = await API.get(`/customer/policy-details/${policyIdInput}`);
//       const d = res.data;
 
//       // ✅ Robust fallback mapping
//       const fetchedPremium =
//         d.annual_premium ??
//         d.premium_amount ??
//         d.premium ??
//         0;
 
//       const fetchedSumAssured =
//         d.sum_assured ??
//         d.coverage_amount ??
//         d.total_claim_amount ??
//         0;
 
//       setFormData(prev => ({
//         ...prev,
//         policy_id: policyIdInput,
//         policy_tenure_years: Number(d.tenure ?? 0),
//         sum_assured: Number(fetchedSumAssured),
//         annual_premium: Number(fetchedPremium)
//       }));
 
//       setIsFetched(true);
//       toast.success("Policy details loaded");
//     } catch {
//       toast.error("Policy not found");
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   const handleChange = e =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });
 
//   /* =====================================================
//      🔮 PREDICT CLAIM AMOUNT
//      ===================================================== */
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
//         (res.data.rejection_reasons || ["Claim rejected"])
//           .forEach(r => toast.error(r));
//       }
//     } catch {
//       toast.error("Prediction failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };
 
//   /* =====================================================
//      🖥 UI (MATCHES YOUR SCREENSHOT)
//      ===================================================== */
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
//                   {/* READ ONLY CONTRACT DATA */}
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




import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { Loader2, CheckCircle, Search, Sparkles, TrendingUp, DollarSign } from "lucide-react";
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

  const inputClass = "w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClass = "text-[10px] text-slate-500 uppercase px-1 tracking-widest text-left block mb-1";

  const handleLookup = async () => {
    if (!policyIdInput) return toast.error("Enter Policy ID");
    setLoading(true);
    try {
      const res = await API.get(`/customer/policy-details/${policyIdInput}`);
      const d = res.data;
      const fetchedPremium = d.annual_premium ?? d.premium_amount ?? d.premium ?? 0;
      const fetchedSumAssured = d.sum_assured ?? d.coverage_amount ?? d.total_claim_amount ?? 0;

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

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        
        // 🎉 PARTY BLAST
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#ffffff"]
        });

        // ⏱ REDIRECT AFTER 4 SECONDS
        toast.info("Redirecting to your policies...");
        setTimeout(() => navigate("/customer/claim-policies"), 4000);
      } else {
        (res.data.rejection_reasons || ["Claim rejected"]).forEach(r => toast.error(r));
      }
    } catch {
      toast.error("Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] font-mono text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />

        <main className="p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            {predictedAmount !== null ? (
              /* --- SUCCESS VIEW --- */
              <div className="bg-[#111e32] border border-white p-12 text-center space-y-8 animate-in zoom-in duration-500 shadow-2xl">
                <div className="flex justify-center">
                   <div className="bg-emerald-500/10 p-6 rounded-full border border-emerald-500/20">
                    <CheckCircle size={80} className="text-emerald-400 animate-bounce" />
                   </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">Congratulations!</h1>
                  <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-sm">Analysis Complete</p>
                </div>
                
                <div className="bg-black border border-white/20 py-10 rounded-2xl shadow-inner">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Estimated claimable amount</p>
                  <h3 className="text-6xl font-black text-white flex items-center justify-center gap-2">
                    <span className="text-blue-500">₹</span>
                    {predictedAmount.toLocaleString()}
                  </h3>
                </div>

                <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] animate-pulse">
                  Returning to your active policies in 4 seconds...
                </p>
              </div>
            ) : (
              /* --- FORM VIEW --- */
              <div className="bg-[#111e32] border border-white shadow-2xl">
                <div className="bg-[#1a2c46] p-6 flex items-center gap-4 border-b border-white">
                  <div className="bg-black p-3 border border-gray-700">
                    <TrendingUp className="text-blue-400" size={24} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold uppercase tracking-widest">Health Payout Predictor</h2>
                    <p className="text-[10px] text-slate-400 uppercase">Input metrics for claim amount estimation.</p>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* SEARCH BAR */}
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        className={`${inputClass} pl-12`}
                        placeholder="Enter Policy ID (e.g. PL-PLA-8533)"
                        value={policyIdInput}
                        onChange={e => setPolicyIdInput(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleLookup}
                      className="bg-blue-600 hover:bg-blue-500 px-10 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Fetch"}
                    </button>
                  </div>

                  {isFetched && (
                    <form onSubmit={handlePredict} className="space-y-8 animate-in fade-in duration-500">
                      {/* READ ONLY DATA */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Contract Tenure</label>
                          <div className={`${inputClass} bg-slate-800/50 border-dashed`}>{formData.policy_tenure_years} Years</div>
                        </div>
                        <div>
                          <label className={labelClass}>Sum Assured</label>
                          <div className={`${inputClass} bg-slate-800/50 border-dashed font-bold`}>₹{formData.sum_assured.toLocaleString()}</div>
                        </div>
                        <div>
                          <label className={labelClass}>Annual Premium</label>
                          <div className={`${inputClass} bg-slate-800/50 border-dashed text-blue-400`}>₹{formData.annual_premium.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 w-full" />

                      {/* INPUT FIELDS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-left">
                        <div><label className={labelClass}>Age</label><input name="age" type="number" onChange={handleChange} className={inputClass} placeholder="yrs" required /></div>
                        <div><label className={labelClass}>Weight</label><input name="weight" type="number" onChange={handleChange} className={inputClass} placeholder="kg" required /></div>
                        <div><label className={labelClass}>BMI</label><input name="bmi" type="number" step="0.1" onChange={handleChange} className={inputClass} placeholder="index" required /></div>
                        
                        <div><label className={labelClass}>Blood Pressure</label><input name="bloodpressure" type="number" onChange={handleChange} className={inputClass} placeholder="mmHg" required /></div>
                        <div><label className={labelClass}>Prior Claims</label><input name="prior_claims_count" type="number" onChange={handleChange} className={inputClass} placeholder="count" required /></div>
                        <div>
                          <label className={labelClass}>Diabetes</label>
                          <select name="diabetes" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="1">Yes</option><option value="0">No</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>Smoker</label>
                          <select name="smoker" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="1">Yes</option><option value="0">No</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Exercise</label>
                          <select name="regular_ex" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="1">Regular</option><option value="0">No</option>
                          </select>
                        </div>
                        <div><label className={labelClass}>Health Risk Score</label><input name="health_risk_score" type="number" onChange={handleChange} className={inputClass} placeholder="1-100" required /></div>

                        <div><label className={labelClass}>Hereditary Diseases</label><input name="hereditary_diseases" onChange={handleChange} className={inputClass} placeholder="Condition" /></div>
                        <div>
                          <label className={labelClass}>Incident Severity</label>
                          <select name="incident_severity" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Region Risk</label>
                          <select name="region_risk_level" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>Coverage Type</label>
                          <select name="policy_coverage_details" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="Individual">Individual</option><option value="Family">Family</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Frequency</label>
                          <select name="payment_frequency" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="Annual">Annual</option><option value="Monthly">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Gender</label>
                          <select name="gender" onChange={handleChange} className={inputClass} required>
                            <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-3 mt-6 shadow-lg shadow-green-900/20"
                      >
                        {submitting ? <Loader2 className="animate-spin" /> : <><Sparkles size={20}/> Predict Claim Amount</>}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AmountPredict;
