import React from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";

function CustAskQuestion() {
  const inputStyle = "bg-slate-800/50 border border-slate-700 rounded-xl p-4 w-full text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-500";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <CustSidebar />
      <div className="flex-1 flex flex-col">
        <CustNavbar />
        <main className="p-8">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-white mb-8 tracking-tight">Ask Question</motion.h1>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-3xl">
            <form className="space-y-6">
              <input type="text" placeholder="Subject" className={inputStyle} />
              <textarea rows="5" placeholder="Enter your question in detail..." className={inputStyle} />
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                <Send size={18} />
                Submit Question
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default CustAskQuestion;
