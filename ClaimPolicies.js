import React, { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { ShieldCheck, ArrowRight } from "lucide-react";

function ClaimPolicies() {
  const [policies, setPolicies] = useState([]);
  const customerId = localStorage.getItem("customer_id");

  useEffect(() => {
    const fetchClaimable = async () => {
      // ✅ Fetching only issued/approved policies for this user
      const res = await API.get(`/customer/issued-policies?customer_id=${customerId}`);
      setPolicies(res.data);
    };
    fetchClaimable();
  }, [customerId]);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white font-mono">
      <CustSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustNavbar />
        <main className="p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
            Claimable Policies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((p) => (
              <div key={p.policy_id} className="bg-[#111e32] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg"><ShieldCheck className="text-blue-400" /></div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase">Policy ID</p>
                    <h3 className="font-bold">{p.policy_id}</h3>
                    <p className="text-xs text-emerald-400 font-bold">{p.plan_name}</p>
                  </div>
                </div>
                <button className="bg-white text-black text-[10px] font-black px-4 py-2 hover:bg-blue-500 hover:text-white transition-all">
                  VIEW_DETAILS
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClaimPolicies;
