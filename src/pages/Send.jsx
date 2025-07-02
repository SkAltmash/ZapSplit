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
        <button
          onClick={() => navigate("/pay-mobile")}
          className="bg-white dark:bg-[#1a1a1a] border p-4 rounded-xl flex flex-col items-center shadow hover:shadow-md"
        >
          <FiPhone className="text-3xl text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-sm">Pay by Mobile</span>
        </button>

        <button
          onClick={() => navigate("/pay-id")}
          className="bg-white dark:bg-[#1a1a1a] border p-4 rounded-xl flex flex-col items-center shadow hover:shadow-md"
        >
          <FiAtSign className="text-3xl text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-sm">Pay by UPI ID</span>
        </button>

        <button
          onClick={() => navigate("/scan-pay")}
          className="bg-white dark:bg-[#1a1a1a] border p-4 rounded-xl flex flex-col items-center shadow hover:shadow-md"
        >
          <FiCamera className="text-3xl text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-sm">Scan & Pay</span>
        </button>
      </div>
    </div>
  );
};

export default Send;
