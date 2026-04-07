import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Grid, CheckCircle } from "lucide-react";
import axios from "axios";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl"
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`p-3 rounded-lg bg-slate-800/50 border border-white/5 ${colorClass}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <h2 className="text-slate-400 text-sm font-medium">{title}</h2>
    <p className="text-3xl font-bold text-white mt-1">{value}</p>
  </motion.div>
);

function CustDashboard() {
  const customerId = localStorage.getItem("customer_id");

  const [stats, setStats] = useState({
    available_policies: 0,
    applied_policies: 0,
    claimed_policies: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/customer/dashboard-stats?customer_id=${customerId}`
        );
        setStats(res.data);
      } catch (err) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) fetchStats();
  }, [customerId]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      <CustSidebar />

      <div className="flex-1 flex flex-col">
        <CustNavbar />

        <main className="p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold text-white">
              Customer <span className="text-blue-500">Dashboard</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Overview of your policy activity
            </p>
          </motion.div>

          {loading ? (
            <p className="text-slate-400">Loading dashboard...</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <StatCard
                title="Available Policies"
                value={stats.available_policies}
                icon={Grid}
                colorClass="text-purple-400"
              />

              <StatCard
                title="Applied Policies"
                value={stats.applied_policies}
                icon={FileText}
                colorClass="text-blue-400"
              />

              <StatCard
                title="Claimed Policies"
                value={stats.claimed_policies}
                icon={CheckCircle}
                colorClass="text-emerald-400"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 p-8 rounded-3xl bg-slate-900/20 border border-white/5 border-dashed text-center text-slate-500"
          >
            Recent activity and analytics will appear here.
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default CustDashboard;
