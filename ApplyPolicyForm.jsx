import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ApplyPolicyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plan_name: "Health Guard", // Example
    premium_amount: 5000,
    tenure: 1
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // ✅ AUTOMATICALLY grab data from session
    const cid = localStorage.getItem("customer_id");
    const fullName = localStorage.getItem("full_name");
    const email = localStorage.getItem("email");

    if (!cid) {
      toast.error("Please log in again to verify your identity.");
      return;
    }

    // ✅ Combine form data with session data
    const finalPayload = {
      ...formData,
      customer_id: cid,    
      full_name: fullName, 
      email: email,
    };

    try {
      const { data } = await axios.post("http://127.0.0.1:8000/customer/submit-application", finalPayload);
      toast.success(`Submitted! ID: ${data.request_id}`);
      navigate("/customer/policy-history");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="p-8 bg-slate-900 rounded-3xl border border-white/10">
      <h2 className="text-2xl font-bold mb-6">Apply for Policy</h2>
      {/* Form Inputs here (Age, Address, etc.) */}
      <button type="submit" className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all">
        Submit Application
      </button>
    </form>
  );
};

export default ApplyPolicyForm;
