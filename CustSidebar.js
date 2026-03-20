import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { useState } from "react";

function CustSidebar() {

  const [open, setOpen] = useState(true);

  return (

    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-gradient-to-b from-[#0a1628] to-[#0c1f3f] text-white min-h-screen p-5 transition-all duration-300`}
    >

      {/* Menu Header */}

      <div className="flex items-center justify-between mb-10">

        {open && <h2 className="text-lg font-semibold">Menu</h2>}

        <FaBars
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(!open)}
        />

      </div>

      {/* Menu Items */}

      <div className="flex flex-col gap-4">

        <Link
          to="/customer/dashboard"
          className="bg-[#1f2d3d] py-3 px-4 rounded-lg hover:bg-[#2b3f55]"
        >
          {open ? "Dashboard" : "🏠"}
        </Link>

        <Link
          to="/customer/apply-policy"
          className="bg-[#1f2d3d] py-3 px-4 rounded-lg hover:bg-[#2b3f55]"
        >
          {open ? "Apply Policy" : "📄"}
        </Link>

        <Link
          to="/customer/issued-policies"
          className="bg-[#1f2d3d] py-3 px-4 rounded-lg hover:bg-[#2b3f55]"
        >
          {open ? "Issued Policies" : "✅"}
        </Link>

        <Link
          to="/customer/policy-history"
          className="bg-[#1f2d3d] py-3 px-4 rounded-lg hover:bg-[#2b3f55]"
        >
          {open ? "Policy History" : "📜"}
        </Link>

        <Link
          to="/customer/ask-question"
          className="bg-[#1f2d3d] py-3 px-4 rounded-lg hover:bg-[#2b3f55]"
        >
          {open ? "Ask Question" : "❓"}
        </Link>

      </div>

    </div>

  );
}

export default CustSidebar;