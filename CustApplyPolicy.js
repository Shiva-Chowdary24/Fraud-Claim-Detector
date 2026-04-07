import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import API from "../services/api";
import { toast } from "react-toastify";

function CustAskQuestion() {
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [formData, setFormData] = useState({ subject: "", query: "" });

  const inputStyle =
    "bg-[#0a0f1a] border border-slate-800 rounded-2xl p-4 w-full text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner";

  // ✅ Auto-hide floating info message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfo(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        customer_id: localStorage.getItem("customer_id"),
        ...formData,
        user_name: localStorage.getItem("user_name") || "Guest User",
        email: localStorage.getItem("user_email") || "N/A",
      };

      await API.post("/query", payload);
      toast.success("Query sent! Our team will reply shortly.");
      setFormData({ subject: "", query: "" });
    } catch (err) {
      toast.error("Failed to send query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-slate-200 font-sans">
      {/* ✅ Floating Info Message */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed top-6 right-6 z-50 max-w-sm
            bg-gradient-to-br from-blue-600/90 to-indigo-700/90
            text-white p-5 rounded-2xl shadow-2xl border border-white/10
          "
        >
          <h4 className="font-bold text-sm uppercase tracking-widest text-blue-200 mb-1">
            Need Help?
          </h4>
          <p className="text-sm leading-relaxed text-blue-50">
            Clarify your doubts using our <b>Chatbot</b>.
            <br />
            If you couldn’t find any relevant answers, please contact the
            <b> Administrator</b>.
          </p>
        </motion.div>
      )}

      <CustSidebar />

      <div className="flex-1 flex flex-col">
        <CustNavbar />

        <main className="p-10 max-w-4xl">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight uppercase flex items-center gap-3">
              <MessageSquare className="text-blue-500" size={32} />
              Help Desk
            </h1>
            <p className="text-slate-500 text-xs tracking-[0.2em] mt-2 uppercase">
              Submit your technical or policy inquiries
            </p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111e32]/50 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">
                  Subject
                </label>
                <input
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g. Payout Delay, Policy Update"
                  className={inputStyle}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">
                  Detail Description
                </label>
                <textarea
                  required
                  rows="6"
                  value={formData.query}
                  onChange={(e) =>
                    setFormData({ ...formData, query: e.target.value })
                  }
                  placeholder="Explain your concern in detail..."
                  className={`${inputStyle} resize-none`}
                />
              </div>

              <button
                disabled={loading}
                className="
                  flex items-center gap-3
                  bg-blue-600 hover:bg-blue-500
                  text-white px-10 py-4 rounded-2xl
                  font-black uppercase tracking-widest text-xs
                  transition-all active:scale-95
                  shadow-xl shadow-blue-900/30
                "
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                Submit Inquiry
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default CustAskQuestion;
