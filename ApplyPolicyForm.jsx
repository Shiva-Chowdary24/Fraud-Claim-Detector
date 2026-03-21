import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { Send, User, Wallet, Briefcase, Activity, ShieldCheck, ArrowLeft, Calendar } from "lucide-react";
import { toast } from "react-toastify";

function ApplyPolicyForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const policy = location.state?.policy;

  // Retrieve logged-in user email
  const userEmail = localStorage.getItem("email") || "user@example.com"; 

  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    annual_income: "",
    occupation: "",
    nominee_name: "",
    nominee_relation: "",
    medical_history: "",
    identity_number: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Redirect if no policy data was passed
  if (!policy) {
    setTimeout(() => navigate("/customer/apply-policy"), 0);
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Construct the full request payload
      const payload = {
        ...formData,
        email: userEmail, // Critical for "My Requests" filter
        policy_id: policy.id,
        plan_name: policy.plan_name,
        premium_amount: Number(policy.premium_amount),
        tenure: Number(policy.tenure),
        description: policy.description
      };

      // Call the new corrected backend route
      await API.post("/customer/submit-application", payload);
      
      toast.success("Application submitted! Redirecting...");
      
      // Transition back to catalog
      setTimeout(() => {
        navigate("/customer/apply-policy");
      }, 2000);

    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.detail || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-[#1e293b]/40 border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500";
  const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 flex items-center gap-2";

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-slate-200">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Header / Back Link */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Catalog</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <ShieldCheck size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Verified Plan</span>
              </div>
            </div>

            <div className="bg-[#111e32]/80 backdrop-blur-md rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              
              {/* Summary Header */}
              <div className="bg-[#1a2c46] p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{policy.plan_name}</h2>
                  <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                    Application for <span className="text-white underline decoration-blue-500">{userEmail}</span>
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Premium</p>
                    <p className="text-xl font-black text-emerald-400">${policy.premium_amount}<span className="text-xs text-slate-500 font-normal">/yr</span></p>
                  </div>
                  <div className="text-right border-l border-slate-700 pl-6">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Tenure</p>
                    <p className="text-xl font-black text-white">{policy.tenure}<span className="text-xs text-slate-500 font-normal"> Yrs</span></p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* Applicant Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1 md:col-span-2 lg:col-span-1">
                    <label className={labelStyle}><User size={12} /> Full Legal Name</label>
                    <input name="full_name" placeholder="As per ID Proof" onChange={handleChange} required className={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelStyle}><Calendar size={12} /> Age</label>
                      <input name="age" type="number" placeholder="18+" onChange={handleChange} required className={inputStyle} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelStyle}><Wallet size={12} /> Annual Income</label>
                      <input name="annual_income" type="number" placeholder="$" onChange={handleChange} required className={inputStyle} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}><Briefcase size={12} /> Occupation</label>
                    <select name="occupation" onChange={handleChange} required className={inputStyle}>
                      <option value="">Select Occupation</option>
                      <option>Salaried Employee</option>
                      <option>Self-Employed / Business</option>
                      <option>Government Official</option>
                      <option>Freelancer / Consultant</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}>Identity Proof (ID/Passport No.)</label>
                    <input name="identity_number" placeholder="Enter ID Number" onChange={handleChange} required className={inputStyle} />
                  </div>
                </div>

                {/* Nominee Block */}
                <div className="p-6 bg-slate-900/50 rounded-[1.5rem] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className={labelStyle}>Nominee Name</label>
                    <input name="nominee_name" placeholder="Beneficiary Name" onChange={handleChange} required className={inputStyle} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}>Relation with Nominee</label>
                    <input name="nominee_relation" placeholder="e.g., Spouse, Parent" onChange={handleChange} required className={inputStyle} />
                  </div>
                </div>

                {/* Risk Area */}
                <div className="space-y-1">
                  <label className={labelStyle}><Activity size={12} /> Medical / Risk Disclosure</label>
                  <textarea 
                    name="medical_history" 
                    placeholder="Provide details of any existing medical conditions or hazardous hobbies. Enter 'None' if not applicable." 
                    rows="4" 
                    onChange={handleChange} 
                    required 
                    className={`${inputStyle} resize-none`}
                  ></textarea>
                </div>

                {/* Footer / Submit */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-800/50">
                  <p className="text-[11px] text-slate-500 leading-tight max-w-sm">
                    By submitting this application, you confirm that the information provided is accurate and you agree to our terms of service for policy underwriting.
                  </p>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={`w-full md:w-auto px-12 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${
                      submitting ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-900/30"
                    }`}
                  >
                    {submitting ? "Processing..." : <><Send size={18} /> Send for Approval</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ApplyPolicyForm;
