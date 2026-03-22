import React, { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { ShieldCheck, ShieldAlert, Info, X } from "lucide-react";

function ClaimPolicies() {
  const [policies, setPolicies] = useState([]);
  const [selectedDecline, setSelectedDecline] = useState(null); // For "Know More" modal
  const customerId = localStorage.getItem("customer_id");

  useEffect(() => {
    const fetchHistory = async () => {
      // ✅ Fetching logs from fraud_logs where status is Approved or Declined
      const res = await API.get(`/customer/claim-history/${customerId}`);
      setPolicies(res.data);
    };
    fetchHistory();
  }, [customerId]);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white font-mono">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden text-left">
        <CustNavbar />
        <main className="p-8 overflow-y-auto">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-8">My Claim Records</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((p) => (
              <div key={p.Policy_id} className={`p-6 rounded-2xl border flex items-center justify-between ${
                p.status === "Approved" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${p.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {p.status === "Approved" ? <ShieldCheck /> : <ShieldAlert />}
                  </div>
                  <div>
                    <h3 className="font-bold">{p.Policy_id}</h3>
                    <p className={`text-[10px] font-black uppercase ${p.status === "Approved" ? "text-emerald-500" : "text-red-500"}`}>
                      Status: {p.status}
                    </p>
                  </div>
                </div>

                {p.status === "Declined" && (
                  <button 
                    onClick={() => setSelectedDecline(p)}
                    className="flex items-center gap-2 text-[10px] font-black bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-400 transition-all"
                  >
                    <Info size={14} /> KNOW MORE
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* --- REASON MODAL --- */}
      {selectedDecline && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a2c46] border border-white/10 w-full max-w-lg rounded-3xl p-8 relative">
            <button onClick={() => setSelectedDecline(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={24} /></button>
            <h3 className="text-red-500 font-black uppercase text-sm mb-4 tracking-widest">Rejection Reason</h3>
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 italic text-slate-300 leading-relaxed">
              "{selectedDecline.reason || "No specific reason provided by administrator."}"
            </div>
            <p className="mt-6 text-[10px] text-slate-500 uppercase text-center">Click the X to return to your claims list</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaimPolicies;
