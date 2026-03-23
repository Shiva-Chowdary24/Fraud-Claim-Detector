import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Sparkles, Loader2 } from "lucide-react";

function ClaimAmountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handshake from ClaimAmount.js
  const isApproved = location.state?.autoApproved;

  // Security Redirect: If user lacks state (refresh), go back to form
  useEffect(() => {
    if (!isApproved) {
      navigate("/customer/predict");
    }
  }, [isApproved, navigate]);

  const handlePredict = () => {
    // ✅ CONNECTED: Now navigating to the actual prediction page with data
    navigate("/customer/amount-predict", { 
      state: { 
        ...location.state 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 font-sans flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1e293b] border border-slate-700 rounded-3xl shadow-2xl p-8 relative overflow-hidden text-center">
        
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full"></div>

        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <ShieldCheck size={48} className="text-emerald-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight text-center">Claim Auto-Approved</h2>
            <p className="text-sm text-slate-400 px-4">
              Our AI engine found no irregularities. You are eligible for an immediate payout estimation.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <button 
              onClick={handlePredict} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              <Sparkles size={18} />
              Predict Payout Amount
            </button>

            <button 
              onClick={() => navigate("/customer/claim-policies")} 
              className="w-full text-sm text-slate-500 hover:text-slate-300 font-medium py-2 transition-colors flex items-center justify-center gap-1"
            >
              No, thanks. I'll do it later.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimAmountPage;
