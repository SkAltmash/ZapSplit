import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { FiUser, FiSearch, FiShield, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; 
const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();  

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
    setLoading(false);
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", user.id), { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const Skeleton = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-full h-16 rounded-lg bg-gray-200 dark:bg-[#2a2a2a] animate-pulse"
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 mt-12 dark:bg-black text-gray-800 dark:text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex gap-2 items-center">
          <FiUser /> Manage Users
        </h1>

        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md w-full dark:bg-[#1a1a1a] dark:text-white"
          />
          <FiSearch />
        </div>

        {loading ? (
          <Skeleton />
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
               onClick={() => navigate(`/admin/users/${u.id}`)}                  className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] shadow-sm rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || "User"}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{u.name || "No Name"}</p>
                    <p className="text-xs text-gray-400">Mobil: {u.mobile}</p>

                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRoleToggle(u)}
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1
                      ${u.role === "admin"
                        ? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200"
                        : "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200"}
                    `}
                  >
                    <FiShield />
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
