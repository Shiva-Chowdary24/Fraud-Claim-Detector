import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function AdminLayout({ children }) {

const [open,setOpen] = useState(true)
const navigate = useNavigate()

const logout = () => {

localStorage.removeItem("token")
navigate("/admin-login")

}

return(

<div className="min-h-screen flex flex-col">

{/* Navbar */}

<div className="bg-blue-900 text-white flex justify-between items-center px-6 py-3">

<h1 className="text-lg font-semibold">
Insurance Management Portal
</h1>

<div className="flex items-center gap-6 mr-8">

<span>Admin Panel</span>

<button
  onClick={async () => { await logout(); navigate("/login", { replace: true }); }}
  className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
>
  Logout
</button>

</div>

</div>


<div className="flex flex-1">

{/* Sidebar */}

<div
className={`bg-gray-900 text-white transition-all duration-300
${open ? "w-64 p-5" : "w-14 p-3"} min-h-screen`}
>

{/* Menu Toggle */}

<button
onClick={()=>setOpen(!open)}
className="flex items-center gap-2 mb-6 cursor-pointer"
>

<div className="flex flex-col gap-1">

<span className="block w-6 h-0.5 bg-white"></span>
<span className="block w-6 h-0.5 bg-white"></span>
<span className="block w-6 h-0.5 bg-white"></span>

</div>

{open && <span className="text-sm font-medium">Menu</span>}

</button>


{/* Sidebar Menu */}

{open && (

<nav className="flex flex-col gap-4">

<Link
to="/admin/dashboard"
className="bg-gray-800 p-3 rounded hover:bg-gray-700"
>
Home
</Link>
<Link
to="/admin/Issue-policy"
className="bg-gray-800 p-3 rounded hover:bg-gray-700"
>
Issue Policies
</Link>

<Link
to="/admin/add"
className="bg-gray-800 p-3 rounded hover:bg-gray-700"
>
Add Dealer
</Link>

<Link
to="/admin/delete"
className="bg-gray-800 p-3 rounded hover:bg-gray-700"
>
Delete Dealer
</Link>

<Link
to="/admin/logs"
className="bg-gray-800 p-3 rounded hover:bg-gray-700"
>
Fraud Logs
</Link>
<Link
to="/admin/policy-requests"
className="bg-gray-800 p-3 rounded hover:bg-gray-700"
>
Policy Approval Requests
</Link>

<Link
to="/admin/customer-queries"
className="bg-gray-800 p-3 rounded hover:bg-gray-700"
>
Customer Queries
</Link>
<Link to="/admin/audit-logs" className="bg-gray-800 p-3 rounded">
Audit Logs
</Link>

</nav>

)}

</div>


{/* Page Content */}

<div className="flex-1 bg-gray-100 p-10 flex justify-center">

<div className="w-full max-w-5xl bg-white p-10 rounded shadow">

{children}

</div>

</div>

</div>

</div>

)

}

export default AdminLayout
