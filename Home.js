import { Link } from "react-router-dom";



function Home() {



return (



<div className="flex justify-center items-center h-screen bg-gray-100">



<div className="bg-white p-10 rounded shadow w-96">



<h1 className="text-2xl font-bold text-center mb-8">

Fraud Detection System

</h1>



<div className="space-y-4">



<Link to="/predict">

<button className="w-full bg-red-500 text-white p-3 rounded">

Fraud Prediction

</button>

</Link>



<Link to="/add">

<button className="w-full bg-green-500 text-white p-3 rounded">

Add Dealer

</button>

</Link>



<Link to="/delete">

<button className="w-full bg-yellow-500 text-white p-3 rounded">

Delete Dealer

</button>

</Link>



<Link to="/logs">

<button className="w-full bg-blue-500 text-white p-3 rounded">

Fraud Logs

</button>

</Link>



</div>



</div>



</div>



);



}



export default Home;
