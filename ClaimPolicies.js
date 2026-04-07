import React, { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { ShieldCheck, ShieldAlert } from "lucide-react";

function ClaimPolicies() {
  const [policies, setPolicies] = useState([]);
  const customerId = localStorage.getItem("customer_id");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await API.get(
          `/customer/claim-policies/${customerId}`
        );
        setPolicies(res.data);
      } catch (err) {
        console.error("Failed to fetch claim policies", err);
      }
    };

    if (customerId) {
      fetchPolicies();
    }
  }, [customerId]);

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white font-mono">
      <CustSidebar />

      <div className="flex-1 flex flex-col overflow-hidden text-left">
        <CustNavbar />

        <main className="p-8 overflow-y-auto">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-8">
            My Claim Records
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.length > 0 ? (
              policies.map((p) => (
                <div
                  key={p.policy_id}
                  className={`p-6 rounded-2xl border flex items-center justify-between ${
                    p.status === "Active"
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        p.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {p.status === "Active" ? (
                        <ShieldCheck />
                      ) : (
                        <ShieldAlert />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold">{p.policy_id}</h3>

                      <p className="text-xs text-slate-400 mt-1">
                        Claimable Amount: ₹{p.claimable_amount}
                      </p>

                      <p
                        className={`text-[10px] font-black uppercase mt-1 ${
                          p.status === "Active"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        Status: {p.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">
                No claim predictions found.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClaimPolicies;
