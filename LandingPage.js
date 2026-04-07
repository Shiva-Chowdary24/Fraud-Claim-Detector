import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Building2, BarChart3, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Fraud Detection",
    desc: "Advanced AI models analyze claims in real-time to pinpoint suspicious patterns before they impact your bottom line.",
    icon: <ShieldCheck className="w-8 h-8 text-blue-400" />,
  },
  {
    title: "Dealer Management",
    desc: "Streamlined administration tools to onboard, monitor, and manage your dealer network with zero friction.",
    icon: <Building2 className="w-8 h-8 text-purple-400" />,
  },
  {
    title: "Fraud Logs",
    desc: "Comprehensive auditing and predictive logs that turn raw data into actionable security insights.",
    icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            backgroundImage: "url('/images/bg.jpg')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            mixBlendMode: 'overlay' 
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl"
        >
          {/* Removed the Next-Gen Badge from here */}
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Insure <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Guard</span>
          </h1>
          <p className="text-gray-400 mb-10 text-lg md:text-xl leading-relaxed">
            Your safety, our duty. We protect your future with AI-driven trust, 
            enterprise-grade security, and seamless dealer integration.
          </p>

          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate("/login")}
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95"
            >
              Get Started 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* Removed the View Demo button from here */}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-6xl"
        >
          {features.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="relative group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md hover:border-blue-500/50 transition-all shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
