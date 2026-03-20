import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import confetti from "canvas-confetti"; // Install this: npm install canvas-confetti

function ClaimAmount() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("idle"); // 'idle', 'success', 'fraud'
  const [form, setForm] = useState({
    Policy_id: "",
    claim_amount: "",
    incident_date: new Date().toISOString().split("T")[0],
    policy_start_date: "2023-01-01", 
    report_date: new Date().toISOString().split("T")[0],
    annual_premium: "1200", 
    deductible: "500",
    payment_method: "Bank",
    channel: "Online",
    police_reported: "No",
    injury_severity: "None",
    num_prior_claims: "0",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post("/predict", form);
      
      if (res.data.fraud_prediction === 0) {
        // CASE: NOT FRAUD
        setStatus("success");
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Update backend to mark policy as "Ready to Collect"
        await API.post("/customer/mark-collectible", { Policy_id: form.Policy_id });

        setTimeout(() => {
          window.location.reload(); 
        }, 3000);

      } else {
        // CASE: FRAUD DETECTED
        setStatus("fraud");
      }
    } catch (error) {
      toast.error("Process failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-5xl font-bold text-green-600 mb-4">Congratulations! 🎉</h1>
        <p className="text-xl text-gray-700">Your claim is verified. You can now collect your money from the Issued Policies page.</p>
        <p className="text-sm text-gray-400 mt-8">Reloading page...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white shadow-xl rounded-2xl p-8 border">
        <h2 className="text-2xl font-bold mb-6 text-[#0a1628]">File Your Claim</h2>
        
        {status === "fraud" && (
          <div className="mb-6 p-4 bg-orange-100 border-l-4 border-orange-500 text-orange-700">
            <p className="font-bold">Suspicious claim request detected.</p>
            <p className="text-sm">Your request has been sent to the policy issuer for manual review. Please wait for updates.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="Policy_id" placeholder="Policy ID" onChange={(e) => setForm({...form, Policy_id: e.target.value})} className="w-full border p-3 rounded" required />
          <input type="number" name="claim_amount" placeholder="Claim Amount" onChange={(e) => setForm({...form, claim_amount: e.target.value})} className="w-full border p-3 rounded" required />
          {/* Add other hidden or visible fields as needed */}
          
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
          >
            {submitting ? "Analyzing..." : "Submit Claim"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClaimAmount;
