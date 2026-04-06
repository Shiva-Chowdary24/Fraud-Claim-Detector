import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import { ShieldCheck, Clock, ChevronDown, ChevronUp, CreditCard, Info } from "lucide-react";

function CustIssuedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Retrieve auth data from localStorage
  const customerId = localStorage.getItem("customer_id");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        
        // Debugging logs - check these in F12 console
        console.log("Fetching policies for ID:", customerId);
        console.log("User Role being sent:", userRole);

        // ✅ URL must match your @router.get in customer.py
        const res = await API.get(`/customer/issued-policies`, {
          params: { customer_id: customerId }, // Sends as ?customer_id=...
          headers: { 
            "role": userRole // Sends security header
          }
        });
        
        console.log("Response from server:", res.data);
        setPolicies(res.data);
      } catch (err) {
        console.error("Fetch Error Details:", err.response || err);
        
        if (err.response?.status === 403) {
          toast.error("Security access denied. Please re-login.");
        } else {
          toast.error("Failed to load policies. Server might be down.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (customerId && userRole) {
      fetchPolicies();
    } else {
      setLoading(false);
      console.warn("Missing credentials in localStorage");
    }
  }, [customerId, userRole]);

  const handlePayment = (policyId, amount) => {
    toast.info(`Redirecting to payment gateway for $${amount}...`);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="mb-10 text-left">
            <h1 className="text-4xl font-black text-white tracking-tight">My Issued Policies</h1>
            <p className="text-slate-400 text-sm mt-2">View your active protection and manage installments.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : !policies || policies.length === 0 ? (
            <div className="bg-[#111e32]/50 border border-dashed border-slate-800 rounded-[2.5rem] p-20 text-center shadow-2xl">
              <ShieldCheck size={56} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-400 font-medium tracking-tight text-lg">No active policies found.</p>
              <p className="text-slate-600 text-sm mt-1">Once your application is approved, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              {policies.map((policy) => (
                <div key={policy._id || policy.policy_id} className="bg-[#111e32]/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden transition-all hover:border-blue-500/30">
                  
                  {/* Card Header */}
                  <div className="bg-[#1a2c46] p-6 flex justify-between items-center border-b border-slate-800">
                    <div className="text-left">
                      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.2em]">Policy Number</p>
                      <h3 className="text-xl font-black text-blue-400 tracking-tighter">{policy.policy_id}</h3>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest">
                      Active
                    </div>
                  </div>

                  {/* Main Summary */}
                  <div className="p-8 space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Plan</span>
                        <span className="text-white font-bold">{policy.plan_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tenure</span>
                        <span className="text-white font-bold">{policy.tenure} Years</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Premium Status</span>
                        <span className="text-orange-400 font-bold text-xs flex items-center gap-1">
                          <Clock size={12} /> Installment Pending
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => toggleExpand(policy.policy_id)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all border border-slate-700"
                      >
                        {expandedId === policy.policy_id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        {expandedId === policy.policy_id ? "Hide Details" : "Know More"}
                      </button>
                    </div>

                    {expandedId === policy.policy_id && (
                      <div className="mt-4 p-6 bg-black/30 rounded-3xl border border-slate-800/50 space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-start gap-3">
                          <Info size={16} className="text-blue-500 mt-1 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Coverage Info</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Annual Premium: <strong>₹{policy.premium_amount || policy.premium}</strong>. <br/>
                              Approved on: {policy.approved_at ? new Date(policy.approved_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handlePayment(policy.policy_id, policy.premium_amount || policy.premium)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                        >
                          <CreditCard size={18} /> Pay Premium (₹{policy.premium_amount || policy.premium})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CustIssuedPolicies;

@router.get("/customer/issued-policies")
def get_issued(customer_id: str, role: str = Header(None)):
    # 1. Security Check
    if role != "customer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        # 2. Search by customer_id (ensure this matches your DB field name)
        query={
            "$or":[
                {"customer_id":customer_id},
                {"customer_id":int(customer_id) if customer_id.isdigit() else customer_id}
            ]
        }
        results = list(issued_policies.find(query))
        
        for r in results:
            r["_id"] = str(r["_id"])
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database fetch failed")
@router.get("/admin/policy-requests")
def get_requests(role: str = Header(None)):
    verify_admin(role)
    try:
        results = list(policy_requests.find({"status": "Pending"}))
        for r in results:
            r["_id"] = str(r["_id"]) 
        return results
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")


@router.post("/admin/policy-approve/{request_id}")
def approve(request_id: str, role: str = Header(None)):
    verify_admin(role)

    try:
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(404, "Application not found")

        policy_master = policies.find_one({
            "plan_name": req.get("plan_name")
        })

        if not policy_master:
            raise HTTPException(404, "Policy not found in master collection")

        plan_name = req.get("plan_name", "POL")
        prefix = plan_name[:3].upper()
        generated_id = f"PL-{prefix}-{random.randint(1000, 9999)}"

        issued_data = {
            "policy_id": generated_id,
            "customer_id": req.get("customer_id"),
            "plan_name": plan_name,
            "email": req.get("email"),
            "plan_type": policy_master.get("plan_type"),
            "premium_amount": policy_master.get("premium_amount"),
            "total_claim_amount": policy_master.get("total_claim_amount"),
            "tenure": policy_master.get("tenure"),
            "description": policy_master.get("description"),
            "benefits": policy_master.get("benefits"),
            "status": "Active",
            "approved_at": now()
        }

        issued_policies.insert_one(issued_data)
        policy_requests.delete_one({"_id": ObjectId(request_id)})
        
        notifications.insert_one({
            "recipient_id": str(req.get("customer_id")),
            "message": f" Policy '{plan_name}' has been Issued Successfully.",
            "link": "/customer/issued-policies",
            "type": "policy_approved",
            "timestamp": now(),
            "read": False
        })

        # ✅ AUDIT LOG (FIXED)
        log_admin_action(
            "admin1@gmail.com",
            "POLICY_ISSUED",
            f"Issued policy {plan_name} to customer {req.get('customer_id')}",
            
        )

        return {
            "message": "Approved",
            "policy_id": generated_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/policy-decline/{request_id}")
def decline_policy(request_id: str, role: str = Header(None)):
    verify_admin(role)

    try:
        # ✅ Fetch request
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(status_code=404, detail="Application not found")

        customer_id = req.get("customer_id")

        # ✅ Send notification to customer
        notifications.insert_one({
            "recipient_id": str(customer_id),
            "message": (
                "Your policy request was declined. "
                "The policy was not issued. "
                "Please contact the administrator through support."
            ),
            "link": "/customer/ask-question",
            "type": "policy_declined",
            "timestamp": now(),
            "read": False
        })

        # ✅ Audit log
        log_admin_action(
            "admin1@gmail.com",
            "POLICY_ISSUED",
            f"Issued policy {plan_name} to customer {req.get('customer_id')}",
            
        )

        # ✅ Delete the request record
        policy_requests.delete_one({"_id": ObjectId(request_id)})

        return {
            "message": "Policy request declined and customer notified"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import { useEffect, useState } from "react";
import API from "../services/api";
import CustSidebar from "../components/CustSidebar";
import CustNavbar from "../components/CustNavbar";
import { toast } from "react-toastify";
import { ShieldCheck, Clock, ChevronDown, ChevronUp, CreditCard, Info } from "lucide-react";

function CustIssuedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Retrieve auth data from localStorage
  const customerId = localStorage.getItem("customer_id");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        
        // Debugging logs - check these in F12 console
        console.log("Fetching policies for ID:", customerId);
        console.log("User Role being sent:", userRole);

        // ✅ URL must match your @router.get in customer.py
        const res = await API.get(`/customer/issued-policies`, {
          params: { customer_id: customerId }, // Sends as ?customer_id=...
          headers: { 
            "role": userRole // Sends security header
          }
        });
        
        console.log("Response from server:", res.data);
        setPolicies(res.data);
      } catch (err) {
        console.error("Fetch Error Details:", err.response || err);
        
        if (err.response?.status === 403) {
          toast.error("Security access denied. Please re-login.");
        } else {
          toast.error("Failed to load policies. Server might be down.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (customerId && userRole) {
      fetchPolicies();
    } else {
      setLoading(false);
      console.warn("Missing credentials in localStorage");
    }
  }, [customerId, userRole]);

  const handlePayment = (policyId, amount) => {
    toast.info(`Redirecting to payment gateway for $${amount}...`);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628] text-white">
      <CustSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <CustNavbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="mb-10 text-left">
            <h1 className="text-4xl font-black text-white tracking-tight">My Issued Policies</h1>
            <p className="text-slate-400 text-sm mt-2">View your active protection and manage installments.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : !policies || policies.length === 0 ? (
            <div className="bg-[#111e32]/50 border border-dashed border-slate-800 rounded-[2.5rem] p-20 text-center shadow-2xl">
              <ShieldCheck size={56} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-400 font-medium tracking-tight text-lg">No active policies found.</p>
              <p className="text-slate-600 text-sm mt-1">Once your application is approved, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              {policies.map((policy) => (
                <div key={policy._id || policy.policy_id} className="bg-[#111e32]/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden transition-all hover:border-blue-500/30">
                  
                  {/* Card Header */}
                  <div className="bg-[#1a2c46] p-6 flex justify-between items-center border-b border-slate-800">
                    <div className="text-left">
                      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.2em]">Policy Number</p>
                      <h3 className="text-xl font-black text-blue-400 tracking-tighter">{policy.policy_id}</h3>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest">
                      Active
                    </div>
                  </div>

                  {/* Main Summary */}
                  <div className="p-8 space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Plan</span>
                        <span className="text-white font-bold">{policy.plan_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tenure</span>
                        <span className="text-white font-bold">{policy.tenure} Years</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Premium Status</span>
                        <span className="text-orange-400 font-bold text-xs flex items-center gap-1">
                          <Clock size={12} /> Installment Pending
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => toggleExpand(policy.policy_id)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all border border-slate-700"
                      >
                        {expandedId === policy.policy_id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        {expandedId === policy.policy_id ? "Hide Details" : "Know More"}
                      </button>
                    </div>

                    {expandedId === policy.policy_id && (
                      <div className="mt-4 p-6 bg-black/30 rounded-3xl border border-slate-800/50 space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-start gap-3">
                          <Info size={16} className="text-blue-500 mt-1 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Coverage Info</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Annual Premium: <strong>₹{policy.premium_amount || policy.premium}</strong>. <br/>
                              Approved on: {policy.approved_at ? new Date(policy.approved_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handlePayment(policy.policy_id, policy.premium_amount || policy.premium)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                        >
                          <CreditCard size={18} /> Pay Premium (₹{policy.premium_amount || policy.premium})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CustIssuedPolicies;

import { useEffect, useState } from "react";
import API from "../services/api"; 
import AdminLayout from "../components/AdminLayout";
import { CheckCircle, XCircle, User, Activity, Wallet, Clock, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

function PolicyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch pending requests from the backend
  const fetchRequests = async () => {
    try {
      const res = await API.get("/admin/policy-requests");
      // Ensure we only show 'Pending' requests
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to load requests from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Approve: Generates PL-XXX-0000 and moves data to Issued Policies
  const handleApprove = async (id) => {
    try {
      const res = await API.post(`/admin/policy-approve/${id}`);
      toast.success(`Approved! Policy ID: ${res.data.policy_id}`);
      // Remove from the UI list immediately
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error("Could not complete approval");
    }
  };

  // 3. Decline: Rejects the application
  const handleDecline = async (id) => {
    try {
      await API.post(`/admin/policy-decline/${id}`);
      toast.warn("Application Declined");
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={32} /> 
            Policy Approval Requests
          </h2>
          <p className="text-slate-400 mt-2">Underwrite and verify customer insurance applications.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#111e32]/40 border border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
            <Clock className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-medium italic">No new applications to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((req) => (
              <div key={req._id} className="bg-[#111e32]/80 backdrop-blur-md border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-slate-700">
                
                {/* Main Info Section */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* User Profile */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <User size={14} className="text-blue-400" /> Applicant Details
                    </div>
                    <p className="text-white font-bold text-xl">{req.full_name}</p>
                    <p className="text-slate-500 text-xs truncate">{req.email}</p>
                    <div className="inline-block px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-bold uppercase">
                      ID: {req.identity_number || "N/A"}
                    </div>
                  </div>

                  {/* Financial & Risk Data */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Wallet size={14} className="text-emerald-400" /> Income & Job
                    </div>
                    <p className="text-white font-bold text-lg">
                      ${Number(req.annual_income).toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-sm">{req.occupation}</p>
                  </div>

                  {/* Medical Disclosure */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Activity size={14} className="text-red-400" /> Health History
                    </div>
                    <p className="text-slate-300 text-sm italic line-clamp-3 bg-black/20 p-3 rounded-xl border border-slate-800/50">
                      "{req.medical_history || "No disclosures"}"
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="lg:col-span-3 flex flex-col justify-center gap-3">
                    <div className="mb-2 text-right">
                      <p className="text-blue-400 font-bold text-sm">{req.plan_name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        Term: {req.tenure} Years
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(req._id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-emerald-900/20"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleDecline(req._id)}
                        className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl transition-all"
                        title="Decline"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Status Bar */}
                <div className="bg-slate-900/40 px-8 py-3 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                   <span>Request ID: {req.request_id || "NEW"}</span>
                   <span className="flex items-center gap-2 italic font-normal normal-case">
                     Nominee: <span className="text-slate-300">{req.nominee_name}</span> ({req.nominee_relation})
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default PolicyRequests;

