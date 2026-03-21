import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"

function PolicyRequests(){

const [requests,setRequests] = useState([])

// Fetch from backend
useEffect(() => {
axios.get("http://127.0.0.1:8000/admin/policy-requests")
.then(res => setRequests(res.data))
}, [])

// Approve
const approve = async(id) => {
await axios.post(`http://127.0.0.1:8000/admin/policy-approve/${id}`)
setRequests(prev =>
prev.map(r => r._id === id ? {...r, status:"Approved"} : r)
)
}

// Decline
const decline = async(id) => {
await axios.post(`http://127.0.0.1:8000/admin/policy-decline/${id}`)
setRequests(prev =>
prev.map(r => r._id === id ? {...r, status:"Declined"} : r)
)
}

return(

<AdminLayout>

<h2 className="text-2xl font-bold mb-6">
Policy Approval Requests
</h2>

<div className="overflow-x-auto">

<table className="w-full bg-white rounded-lg shadow">

<thead className="bg-gray-200">
<tr>
<th className="p-3">User</th>
<th className="p-3">Policy</th>
<th className="p-3">Status</th>
<th className="p-3">Action</th>
</tr>
</thead>

<tbody>

{requests.map((req) => (

<tr key={req._id} className="border-t text-center">

<td className="p-3">{req.user_name}</td>
<td className="p-3">{req.policy_name}</td>

<td className="p-3">

<span className={
req.status === "Approved"
? "bg-green-100 text-green-600 px-3 py-1 rounded"
: req.status === "Declined"
? "bg-red-100 text-red-600 px-3 py-1 rounded"
: "bg-yellow-100 text-yellow-600 px-3 py-1 rounded"
}>
{req.status}
</span>

</td>

<td className="p-3 flex gap-2 justify-center">

<button
onClick={()=>approve(req._id)}
className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
>
Approve
</button>

<button
onClick={()=>decline(req._id)}
className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
>
Decline
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</AdminLayout>

)

}

export default PolicyRequests
