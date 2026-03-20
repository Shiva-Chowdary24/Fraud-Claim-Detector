// // src/components/predict.js (or Predict.jsx)
// import { useState, useMemo } from "react";
// import API from "../services/api";
// import AdminLayout from "../components/AdminLayout";
// import { AlertCircle, CheckCircle2 } from "lucide-react";

// /** Inline DateInput: shows placeholder until focus, then switches to native date picker */
// const DateInput = ({
//   name,
//   value,
//   onChange,
//   placeholder = "mm/dd/yyyy",
//   required = false,
//   className = "",
//   ...rest
// }) => {
//   const handleFocus = (e) => {
//     e.target.type = "date";
//   };

//   const handleBlur = (e) => {
//     if (!e.target.value) {
//       e.target.type = "text";
//     }
//   };

//   return (
//     <input
//       type={value ? "date" : "text"} // show placeholder when empty
//       name={name}
//       value={value}
//       onChange={onChange}
//       onFocus={handleFocus}
//       onBlur={handleBlur}
//       placeholder={placeholder}
//       required={required}
//       aria-label={name}
//       className={`border p-3 rounded ${className}`}
//       {...rest}
//     />
//   );
// };

// // Helper to normalize select values and dates
// const normalizeForm = (raw) => {
//   // Convert blank strings to null
//   const clean = Object.fromEntries(
//     Object.entries(raw).map(([k, v]) => [k, v === "" ? null : v])
//   );

//   // Normalize enums exactly as backend expects
//   if (typeof clean.police_reported === "string") {
//     clean.police_reported = clean.police_reported === "Yes" ? "Yes" : "No";
//   }
//   if (typeof clean.channel === "string") {
//     clean.channel = clean.channel;
//   }
//   if (typeof clean.payment_method === "string") {
//     clean.payment_method = clean.payment_method;
//   }

//   // ✅ Keep dates as "YYYY-MM-DD" (native date input value)
//   // If your backend needs ISO strings, uncomment below:
//   // const toISO = (d) => (d ? new Date(d).toISOString() : null);
//   // clean.policy_start_date = toISO(clean.policy_start_date);
//   // clean.incident_date = toISO(clean.incident_date);
//   // clean.report_date = toISO(clean.report_date);

//   // Ensure numeric types
//   ["annual_premium", "deductible", "claim_amount", "num_prior_claims"].forEach((f) => {
//     if (clean[f] !== null && clean[f] !== undefined && clean[f] !== "") {
//       clean[f] = Number(clean[f]);
//     }
//   });

//   return clean;
// };

// function Predict() {
//   const [form, setForm] = useState({
//     Policy: "",

//     policy_start_date: "",
//     incident_date: "",
//     report_date: "",

//     annual_premium: "",
//     deductible: "",
//     claim_amount: "",

//     payment_method: "",
//     channel: "",
//     police_reported: "",
//     injury_severity: "",

//     num_prior_claims: "",
//   });

//   const [result, setResult] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   const canSubmit = useMemo(() => {
//     return (
//       form.policy_start_date &&
//       form.incident_date &&
//       form.report_date &&
//       form.annual_premium !== "" &&
//       form.deductible !== "" &&
//       form.claim_amount !== "" &&
//       form.payment_method &&
//       form.channel &&
//       form.police_reported &&
//       form.injury_severity &&
//       form.num_prior_claims !== ""
//     );
//   }, [form]);

//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//     if (errorMsg) setErrorMsg("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setErrorMsg("");
//     setResult(null);

//     try {
//       const payload = normalizeForm(form);
//       const res = await API.post("/predict", payload);
//       setResult(res.data);
//     } catch (error) {
//       const msg =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         error?.message ||
//         "Prediction failed";
//       setErrorMsg(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <AdminLayout>
//       <h2 className="text-2xl font-bold mb-6">Fraud Prediction</h2>

//       {/* Error banner */}
//       {errorMsg && (
//         <div
//           className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300"
//           role="alert"
//           aria-live="assertive"
//         >
//           <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
//           <div className="text-sm font-medium">{errorMsg}</div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Optional: Policy for backend fraud_logs upsert */}
//           <input
//             type="text"
//             name="Policy_id"
//             placeholder="Policy ID"
//             onChange={handleChange}
//             value={form.Policy_id}
//             className="border p-3 rounded"
//           />

//           {/* ✅ Date inputs with visible placeholders */}
//           <DateInput
//             name="policy_start_date"
//             value={form.policy_start_date}
//             onChange={handleChange}
//             placeholder="Policy Start Date"
//             required
//           />
//           <DateInput
//             name="incident_date"
//             value={form.incident_date}
//             onChange={handleChange}
//             placeholder="Incident Date"
//             required
//           />
//           <DateInput
//             name="report_date"
//             value={form.report_date}
//             onChange={handleChange}
//             placeholder="Report Date"
//             required
//           />

//           <input
//             type="number"
//             name="annual_premium"
//             placeholder="Annual Premium"
//             required
//             onChange={handleChange}
//             value={form.annual_premium}
//             className="border p-3 rounded"
//           />
//           <input
//             type="number"
//             name="deductible"
//             placeholder="Deductible"
//             required
//             onChange={handleChange}
//             value={form.deductible}
//             className="border p-3 rounded"
//           />
//           <input
//             type="number"
//             name="claim_amount"
//             placeholder="Claim Amount"
//             required
//             onChange={handleChange}
//             value={form.claim_amount}
//             className="border p-3 rounded"
//           />

//           <select
//             name="payment_method"
//             required
//             onChange={handleChange}
//             value={form.payment_method}
//             className="border p-3 rounded"
//           >
//             <option value="">Payment Method</option>
//             <option>Cash</option>
//             <option>Crypto</option>
//             <option>Bank</option>
//           </select>

//           <select
//             name="channel"
//             required
//             onChange={handleChange}
//             value={form.channel}
//             className="border p-3 rounded"
//           >
//             <option value="">Channel</option>
//             <option>Agent</option>
//             <option>Online</option>
//           </select>

//           <select
//             name="police_reported"
//             required
//             onChange={handleChange}
//             value={form.police_reported}
//             className="border p-3 rounded"
//           >
//             <option value="">Police Reported</option>
//             <option>Yes</option>
//             <option>No</option>
//           </select>

//           <select
//             name="injury_severity"
//             required
//             onChange={handleChange}
//             value={form.injury_severity}
//             className="border p-3 rounded"
//           >
//             <option value="">Injury Severity</option>
//             <option>None</option>
//             <option>Normal</option>
//             <option>Critical</option>
//             <option>Major</option>
//           </select>

//           <input
//             type="number"
//             name="num_prior_claims"
//             placeholder="Prior Claims"
//             required
//             onChange={handleChange}
//             value={form.num_prior_claims}
//             className="border p-3 rounded md:col-span-2"
//           />
//         </div>

//         <button
//           disabled={submitting || !canSubmit}
//           className={`mt-8 px-6 py-3 rounded text-white ${
//             submitting || !canSubmit ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
//           }`}
//         >
//           {submitting ? "Predicting..." : "Predict Fraud"}
//         </button>
//       </form>

//       {result && (
//         <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
//           <div className="flex items-center gap-2 mb-2">
//             <CheckCircle2 className="h-5 w-5" />
//             <h3 className="font-semibold">Prediction Result</h3>
//           </div>
//           <p>
//             <b>Prediction:</b> {String(result.fraud_prediction)}{" "}
//             <span className="text-slate-300">
//               ({result.fraud_prediction === 1 ? "Fraud" : "Not Fraud"})
//             </span>
//           </p>
//           <p>
//             <b>Probability:</b>{" "}
//             {typeof result.fraud_probability === "number"
//               ? result.fraud_probability.toFixed(4)
//               : result.fraud_probability}
//           </p>
//           <p>
//             <b>Reasons:</b> {result.reason_sentences}
//           </p>
//         </div>
//       )}
//     </AdminLayout>
//   );
// }

// export default Predict;
// src/components/Predict.jsx
import { useState, useMemo } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/** Inline DateInput: shows placeholder until focus, then switches to native date picker */
const DateInput = ({
  name,
  value,
  onChange,
  placeholder = "mm/dd/yyyy",
  required = false,
  className = "",
  ...rest
}) => {
  const handleFocus = (e) => {
    e.target.type = "date";
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      e.target.type = "text";
    }
  };

  return (
    <input
      type={value ? "date" : "text"} // show placeholder when empty
      name={name}
      value={value || ""}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      aria-label={name}
      className={`border p-3 rounded ${className}`}
      {...rest}
    />
  );
};

// Helper to normalize select values and dates
const normalizeForm = (raw) => {
  // Convert blank strings to null (except Policy_id; we map it below if needed)
  const clean = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v === "" ? null : v])
  );

  // Map common variants defensively (if someone still uses "Policy")
  if (!clean.Policy_id && clean.Policy) {
    clean.Policy_id = clean.Policy;
    delete clean.Policy;
  }

  // Normalize enums exactly as backend expects
  if (typeof clean.police_reported === "string") {
    clean.police_reported = clean.police_reported === "Yes" ? "Yes" : "No";
  }
  if (typeof clean.channel === "string") {
    clean.channel = clean.channel;
  }
  if (typeof clean.payment_method === "string") {
    clean.payment_method = clean.payment_method;
  }

  // Keep dates as "YYYY-MM-DD" (native date input value)
  // If your backend needs ISO strings, uncomment below:
  // const toISO = (d) => (d ? new Date(d).toISOString() : null);
  // clean.policy_start_date = toISO(clean.policy_start_date);
  // clean.incident_date = toISO(clean.incident_date);
  // clean.report_date = toISO(clean.report_date);

  // Ensure numeric types
  ["annual_premium", "deductible", "claim_amount", "num_prior_claims"].forEach(
    (f) => {
      if (clean[f] !== null && clean[f] !== undefined && clean[f] !== "") {
        clean[f] = Number(clean[f]);
      }
    }
  );

  return clean;
};

function Predict() {
  const [form, setForm] = useState({
    Policy_id: "",            // ✅ use Policy_id consistently

    policy_start_date: "",
    incident_date: "",
    report_date: "",

    annual_premium: "",
    deductible: "",
    claim_amount: "",

    payment_method: "",
    channel: "",
    police_reported: "",
    injury_severity: "",

    num_prior_claims: "",
  });

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = useMemo(() => {
    return (
      form.policy_start_date &&
      form.incident_date &&
      form.report_date &&
      form.annual_premium !== "" &&
      form.deductible !== "" &&
      form.claim_amount !== "" &&
      form.payment_method &&
      form.channel &&
      form.police_reported &&
      form.injury_severity &&
      form.num_prior_claims !== ""
    );
  }, [form]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setResult(null);

    try {
      const payload = normalizeForm(form);
      // Debug (optional): uncomment while troubleshooting
      // console.log("[DEBUG] Will POST /predict with payload:", payload);

      const res = await API.post("/predict", payload);

      // Debug (optional)
      // console.log("[DEBUG] /predict response:", res?.data);

      setResult(res.data);
    } catch (error) {
      // Debug (optional)
      // console.error("[DEBUG] /predict failed:", error);

      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Prediction failed";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Fraud Prediction</h2>

      {/* Error banner */}
      {errorMsg && (
        <div
          className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
          <div className="text-sm font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy ID */}
          <input
            type="text"
            name="Policy_id"
            placeholder="Policy ID"
            onChange={handleChange}
            value={form.Policy_id || ""}
            className="border p-3 rounded"
            autoComplete="off"
          />

          {/* Date inputs with visible placeholders */}
          <DateInput
            name="policy_start_date"
            value={form.policy_start_date}
            onChange={handleChange}
            placeholder="Policy Start Date"
            required
          />
          <DateInput
            name="incident_date"
            value={form.incident_date}
            onChange={handleChange}
            placeholder="Incident Date"
            required
          />
          <DateInput
            name="report_date"
            value={form.report_date}
            onChange={handleChange}
            placeholder="Report Date"
            required
          />

          <input
            type="number"
            name="annual_premium"
            placeholder="Annual Premium"
            required
            onChange={handleChange}
            value={form.annual_premium}
            className="border p-3 rounded"
          />
          <input
            type="number"
            name="deductible"
            placeholder="Deductible"
            required
            onChange={handleChange}
            value={form.deductible}
            className="border p-3 rounded"
          />
          <input
            type="number"
            name="claim_amount"
            placeholder="Claim Amount"
            required
            onChange={handleChange}
            value={form.claim_amount}
            className="border p-3 rounded"
          />

          <select
            name="payment_method"
            required
            onChange={handleChange}
            value={form.payment_method}
            className="border p-3 rounded"
          >
            <option value="">Payment Method</option>
            <option>Cash</option>
            <option>Crypto</option>
            <option>Bank</option>
          </select>

          <select
            name="channel"
            required
            onChange={handleChange}
            value={form.channel}
            className="border p-3 rounded"
          >
            <option value="">Channel</option>
            <option>Agent</option>
            <option>Online</option>
          </select>

          <select
            name="police_reported"
            required
            onChange={handleChange}
            value={form.police_reported}
            className="border p-3 rounded"
          >
            <option value="">Police Reported</option>
            <option>Yes</option>
            <option>No</option>
          </select>

          <select
            name="injury_severity"
            required
            onChange={handleChange}
            value={form.injury_severity}
            className="border p-3 rounded"
          >
            <option value="">Injury Severity</option>
            <option>None</option>
            <option>Normal</option>
            <option>Critical</option>
            <option>Major</option>
          </select>

          <input
            type="number"
            name="num_prior_claims"
            placeholder="Prior Claims"
            required
            onChange={handleChange}
            value={form.num_prior_claims}
            className="border p-3 rounded md:col-span-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className={`mt-8 px-6 py-3 rounded text-white ${
            submitting || !canSubmit
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {submitting ? "Predicting..." : "Predict Fraud"}
        </button>
      </form>

      {result && (
        <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="font-semibold">Prediction Result</h3>
          </div>
          <p>
            <b>Policy ID:</b> {result.Policy_id}
          </p>
          <p>
            <b>Prediction:</b> {String(result.fraud_prediction)}{" "}
            <span className="text-slate-300">
              ({result.fraud_prediction === 1 ? "Fraud" : "Not Fraud"})
            </span>
          </p>
          <p>
            <b>Probability:</b>{" "}
            {typeof result.fraud_probability === "number"
              ? (result.fraud_probability * 100).toFixed(1) + "%"
              : result.fraud_probability}
          </p>
          <p>
            <b>Reasons:</b> {result.reason_sentences}
          </p>
        </div>
      )}
    </AdminLayout>
  );
}

export default Predict;