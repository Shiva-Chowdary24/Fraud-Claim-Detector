import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "../components/AdminLayout"

function CustomerQueries(){

const [queries,setQueries] = useState([])
const [reply,setReply] = useState("")

useEffect(() => {
axios.get("http://127.0.0.1:8000/admin/queries")
.then(res => setQueries(res.data))
}, [])

// Send reply
const sendReply = async(id) => {

await axios.post(`http://127.0.0.1:8000/admin/reply/${id}`,{
reply: reply
})

alert("Reply sent")

}

return(

<AdminLayout>

<h2 className="text-2xl font-bold mb-6">
Customer Queries
</h2>

<div className="space-y-6">

{queries.map(q => (

<div key={q._id} className="bg-white p-5 rounded shadow">

<p className="font-semibold text-lg">
{q.user_name}
</p>

<p className="text-gray-600 mb-3">
{q.query}
</p>

<textarea
placeholder="Write reply..."
className="border p-2 w-full mb-2"
onChange={(e)=>setReply(e.target.value)}
/>

<button
onClick={()=>sendReply(q._id)}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Reply
</button>

</div>

))}

</div>

</AdminLayout>

)

}

export default CustomerQueries
