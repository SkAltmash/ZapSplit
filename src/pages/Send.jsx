import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query } from "firebase/firestore";
import { FiPhone, FiAtSign, FiCamera, FiSearch } from "react-icons/fi";

const Send = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setCurrentUser(u);
        try {
          const q = query(collection(db, "users"));
          const snap = await getDocs(q);
          const allUsers = snap.docs
            .filter((doc) => doc.id !== u.uid)
            .map((doc) => ({ id: doc.id, ...doc.data() }));
          const limited = allUsers.slice(0, 4);
          setUsers(limited);
          setFiltered(limited);
        } catch (err) {
          console.error("Failed to fetch users:", err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            String(u.mobile || "").toLowerCase().includes(q)
        )
      );
    }
  }, [search, users]);

  return (
    <div className="min-h-screen px-4 py-10 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white mt-12">
      <h1 className="text-3xl font-bold mb-6">Send Money</h1>

      <h2 className="text-lg font-semibold mb-3">People on ZapSplit</h2>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people on ZapSplit"
          className="w-full pl-10 pr-3 py-2 rounded-md border dark:bg-[#1a1a1a] dark:text-white text-sm"
        />
      </div>

      {/* User Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-4 rounded-xl shadow border animate-pulse bg-white dark:bg-[#1a1a1a]"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-[#2a2a2a]" />
              <div className="h-4 w-20 bg-gray-300 dark:bg-[#2a2a2a] rounded" />
              <div className="h-3 w-16 bg-gray-300 dark:bg-[#2a2a2a] rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No users found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          {filtered.map((user) => (
            <button
              key={user.id}
              onClick={() => navigate(`/send/${user.id}`)}
              className="flex flex-col items-center gap-2 bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow hover:shadow-md border"
            >
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg uppercase overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user.name?.[0] || user.email?.[0]
                )}
              </div>
              <div className="text-sm text-center">
                {user.name || user.email}
                <br />
                <span className="text-xs text-gray-500">{user.mobile}</span>
              </div>
            </button>
          ))}
        </div>
      )}
{/* Other Options */}
<h2 className="text-lg font-semibold mb-3">Other Options</h2>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

  {/* Pay by Mobile */}
  <button
    onClick={() => navigate("/pay-mobile")}
    className="group bg-purple-50 dark:bg-[#1b1327] border border-purple-200 dark:border-purple-800 p-5 rounded-xl shadow transition hover:shadow-lg hover:scale-[1.02] flex flex-col items-center"
  >
    <div className="bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200 rounded-full p-3 mb-3">
      <FiPhone className="text-2xl" />
    </div>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Pay by Mobile</span>
  </button>

  {/* Pay by UPI ID */}
  <button
    onClick={() => navigate("/pay-id")}
    className="group bg-green-50 dark:bg-[#13271b] border border-green-200 dark:border-green-800 p-5 rounded-xl shadow transition hover:shadow-lg hover:scale-[1.02] flex flex-col items-center"
  >
    <div className="bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded-full p-3 mb-3">
      <FiAtSign className="text-2xl" />
    </div>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Pay by UPI ID</span>
  </button>

  {/* Scan & Pay */}
  <button
    onClick={() => navigate("/scan-pay")}
    className="group bg-blue-50 dark:bg-[#13202b] border border-blue-200 dark:border-blue-800 p-5 rounded-xl shadow transition hover:shadow-lg hover:scale-[1.02] flex flex-col items-center"
  >
    <div className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-full p-3 mb-3">
      <FiCamera className="text-2xl" />
    </div>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Scan & Pay</span>
  </button>
</div>

    </div>
  );
};

export default Send;
