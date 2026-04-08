import {Link} from "react-router-dom"

function Sidebar(){

return(

<div className="bg-gray-900 text-white w-64 min-h-screen p-5">

<h2 className="text-lg font-bold mb-6">
Admin Menu
</h2>

<div className="flex flex-col gap-3">
<Link to="/admin/add">
<div className="bg-gray-800 p-3 rounded hover:bg-blue-600">
Add Dealer
</div>
</Link>

<Link to="/admin/delete">
<div className="bg-gray-800 p-3 rounded hover:bg-blue-600">
Delete Dealer
</div>
</Link>

<Link to="/admin/logs">
<div className="bg-gray-800 p-3 rounded hover:bg-blue-600">
Fraud Logs
</div>
</Link>
<Link to="/admin/policy-requests">
<div className="bg-gray-800 p-3 rounded hover:bg-blue-600">
Policy Approval Requests
</div>
</Link>

<Link to="/admin/customer-queries">
<div className="bg-gray-800 p-3 rounded hover:bg-blue-600">
Customer Queries
</div>
</Link>

</div>

</div>

)

}

export default Sidebar
