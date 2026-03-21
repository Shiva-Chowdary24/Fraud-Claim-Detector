import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { Send, User, Wallet, Briefcase, Activity, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

function ApplyPolicyForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const policy = location.state?.policy;

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

  // If someone accesses this page without selecting a policy, send them back
  if (!policy) {
    navigate("/customer/apply-policy");
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        policy_id: policy.id,
        plan_name: policy.plan_name,
        premium_amount: Number(policy.premium_amount),
        tenure: Number(policy.tenure),
        status: "Pending", // For Admin Approval
        applied_date: new Date().toISOString(),
      };

      await API.post("/customer/submit-application", payload);
      
      toast.success("Application submitted for Admin approval!");
      
      // Smooth transition back to the catalog
      setTimeout(() => {
        navigate("/customer/apply-policy");
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-[#1e293b]/50 border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500";
  const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 flex items-center gap-2";

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-slate-200">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Catalog</span>
            </button>

            <div className="bg-[#111e32]/80 backdrop-blur-md rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              
              {/* Form Header */}
              <div className="bg-[#1a2c46] p-8 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Policy Application</h2>
                  <p className="text-slate-400 text-sm mt-1">Finalize your request for <span className="text-blue-400 font-semibold">{policy.plan_name}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selected Plan Cost</p>
                  <p className="text-2xl font-black text-emerald-400">${policy.premium_amount}<span className="text-sm text-slate-500">/yr</span></p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* Section: Applicant Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className={labelStyle}><User size={12} /> Full Name</label>
                    <input name="full_name" placeholder="John Doe" onChange={handleChange} required className={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelStyle}>Age</label>
                      <input name="age" type="number" placeholder="25" onChange={handleChange} required className={inputStyle} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelStyle}><Wallet size={12} /> Annual Income</label>
                      <input name="annual_income" type="number" placeholder="50000" onChange={handleChange} required className={inputStyle} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}><Briefcase size={12} /> Occupation</label>
                    <select name="occupation" onChange={handleChange} required className={inputStyle}>
                      <option value="">Select Occupation</option>
                      <option>Salaried</option>
                      <option>Self-Employed</option>
                      <option>Business</option>
                      <option>Student</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}>Identity Proof Number (Passport/ID)</label>
                    <input name="identity_number" placeholder="ABC123456" onChange={handleChange} required className={inputStyle} />
                  </div>
                </div>

                {/* Section: Nominee */}
                <div className="p-6 bg-black/20 rounded-2xl border border-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className={labelStyle}>Nominee Full Name</label>
                    <input name="nominee_name" placeholder="Jane Doe" onChange={handleChange} required className={inputStyle} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelStyle}>Nominee Relation</label>
                    <input name="nominee_relation" placeholder="Spouse / Parent" onChange={handleChange} required className={inputStyle} />
                  </div>
                </div>

                {/* Section: History */}
                <div className="space-y-1">
                  <label className={labelStyle}><Activity size={12} /> Medical History / Risk Disclosure</label>
                  <textarea 
                    name="medical_history" 
                    placeholder="Briefly describe any pre-existing conditions or mark 'None'..." 
                    rows="3" 
                    onChange={handleChange} 
                    required 
                    className={inputStyle}
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <ShieldCheck size={16} className="text-blue-500" />
                    <span>Secure end-to-end encrypted application</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={`px-10 py-4 rounded-2xl text-white font-bold flex items-center gap-3 transition-all shadow-xl ${
                      submitting ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-900/20"
                    }`}
                  >
                    {submitting ? "Sending Request..." : <><Send size={18} /> Submit for Approval</>}
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
