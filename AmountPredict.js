import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti"; // ✅ Import Confetti
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { CheckCircle, ArrowRight, Wallet, ShieldCheck } from "lucide-react";

function AmountPredict() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prediction, setPrediction] = useState({
    amount: 0,
    policyId: ""
  });

  useEffect(() => {
    // 1. Security Check
    if (!location.state?.autoApproved) {
      navigate("/customer/claim-amount");
      return;
    }

    // 2. Simulate AI Prediction
    const runAI = () => {
      setLoading(true);
      setTimeout(() => {
        const calculatedAmount = 4500.00; // This should come from your API
        setPrediction({
          amount: calculatedAmount,
          policyId: location.state?.policyId || "POL-9982"
        });
        
        setLoading(false);
        setShowSuccess(true);
        
        // ✅ 3. TRIGGER PARTY BLAST (Confetti)
        triggerConfetti();

        // ✅ 4. REDIRECT AFTER 5 SECONDS
        setTimeout(() => {
          navigate("/customer/claim-policies");
        }, 5000);
      }, 2000);
    };

    runAI();
  }, [location, navigate]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#3b82f6", "#ffffff", "#10b981"]
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#3b82f6", "#ffffff", "#10b981"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white font-mono">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        
        <main className="flex-1 flex items-center justify-center p-8">
          {loading ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="uppercase tracking-[0.3em] text-slate-500 text-xs">AI_Analyzing_Payout_Potential...</p>
            </div>
          ) : showSuccess ? (
            /* ✅ CONGRATULATIONS VIEW */
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
              <div className="bg-emerald-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto border border-emerald-500/50">
                <CheckCircle size={48} className="text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Congratulations!</h1>
                <p className="text-xl text-emerald-400 font-bold">
                  The claimable amount is up to <span className="text-white">${prediction.amount}</span>
                </p>
              </div>

              <div className="pt-10">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">
                  Redirecting to your active claim policies...
                </p>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AmountPredict;
