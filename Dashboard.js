import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import axios from "axios";
function Dashboard() {
 const [stats, setStats] = useState({
   totalClaims: 0,
   fraudsDetected: 0,
   totalCustomers: 0,
   availablePolicies: 0,
 });
 const [loading, setLoading] = useState(true);
 useEffect(() => {
   const fetchStats = async () => {
     try {
       const role = localStorage.getItem("role"); // or however you store the role
       const response = await axios.get("http://localhost:8000/admin/dashboard", {
         headers: { role: role },
       });
       setStats(response.data);
     } catch (error) {
       console.error("Error fetching dashboard stats:", error);
     } finally {
       setLoading(false);
     }
   };
   fetchStats();
 }, []);
 return (
<AdminLayout>
<h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
<p className="text-gray-600 mb-8">
       Welcome to the Insurance Management Admin Panel. Manage records and detect fraudulent claims.
</p>
     {loading ? (
<p>Loading statistics...</p>
     ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Total Claims */}
<div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-lg shadow-lg">
<h3 className="text-lg opacity-90">Total Claims</h3>
<p className="text-4xl font-bold mt-2">{stats.totalClaims}</p>
</div>
         {/* Fraud Detected */}
<div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-lg shadow-lg">
<h3 className="text-lg opacity-90">Fraud Detected</h3>
<p className="text-4xl font-bold mt-2">{stats.fraudsDetected}</p>
</div>
         {/* Total Customers */}
<div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg">
<h3 className="text-lg opacity-90">Total Customers</h3>
<p className="text-4xl font-bold mt-2">{stats.totalCustomers}</p>
</div>
         {/* Available Policies */}
<div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-lg">
<h3 className="text-lg opacity-90">Available Policies</h3>
<p className="text-4xl font-bold mt-2">{stats.availablePolicies}</p>
</div>
</div>
     )}
</AdminLayout>
 );
}
export default Dashboard;
