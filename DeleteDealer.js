import { useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { Trash2, Search } from "lucide-react";

function DeleteDealer() {
  const [policy, setPolicy] = useState("");
  const [deleted, setDeleted] = useState(false);

  const deleteDealer = async () => {
    if (!policy && !deleted) {
      toast.error("Please enter a Policy ID");
      return;
    }

    // ✅ If already deleted, just show success again
    if (deleted) {
      toast.success("Successfully deleted");
      return;
    }

    if (!window.confirm("Are you sure? This action is permanent.")) return;

    try {
      const res = await API.delete(`/admin/dealer/delete/${policy}`);
      toast.success("Successfully deleted");   // ✅ exact message
      setDeleted(true);                        // ✅ block further API calls
      setPolicy("");                           // optional
    } catch (error) {
      if (error.response?.status === 404) {
        toast.warn("Dealer not found");
      } else {
        toast.error("Error deleting dealer");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-10 tracking-widest uppercase border-b border-white pb-2 inline-block text-red-500">
          Delete Dealer Record
        </h2>

        <div className="relative group mb-8">
          <div className="absolute left-0 top-2 text-gray-500 group-focus-within:text-red-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            placeholder="Enter Policy ID to Remove"
            className="w-full bg-transparent border-b border-gray-700 py-2 pl-10 outline-none focus:border-red-500 transition-all text-white placeholder-gray-600 font-mono"
            value={policy}
            onChange={(e) => {
              setPolicy(e.target.value);
              setDeleted(false); // ✅ reset when new ID typed
            }}
          />
        </div>

        <button
          onClick={deleteDealer}
          className="flex items-center justify-center gap-2 border border-red-500 text-red-500 w-full p-4 font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 size={18} /> Permanently Delete
        </button>
      </div>
    </AdminLayout>
  );
}

export default DeleteDealer;
