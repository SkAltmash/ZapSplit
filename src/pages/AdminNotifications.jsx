import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FaBell, FaUserCheck, FaCheckCircle } from "react-icons/fa";

const AdminNotifications = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelect = (uid) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.uid));
    }
  };

  const handleSend = async () => {
    if (!message.trim() || selectedUsers.length === 0) {
      toast.error("Message and users required");
      return;
    }

    setLoading(true);
    const promises = [];

    selectedUsers.forEach((uid) => {
      const notifRef = collection(db, "users", uid, "notifications");
      promises.push(
        addDoc(notifRef, {
          message,
          seen: false,
          createdAt: serverTimestamp(),
        })
        
      );
    });

    try {
      await Promise.all(promises);
      toast.success("Notifications sent successfully");
      setMessage("");
      setSelectedUsers([]);
    } catch {
      toast.error("Failed to send notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-12 dark:bg-black text-gray-800 dark:text-white px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#0d0d0d] p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <FaBell className="dark:text-white text-black" />
          Admin Notifications
        </h1>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your notification message..."
          className="w-full h-20 p-2 border rounded-md mb-4 dark:bg-black dark:border-gray-700"
        />

        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-sm">
            Select Users ({selectedUsers.length}/{users.length})
          </p>
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {selectedUsers.length === users.length ? "Unselect All" : "Select All"}
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-2 dark:border-gray-700">
          {users.map((user) => (
            <div
              key={user.uid}
              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer
                ${
                  selectedUsers.includes(user.uid)
                    ? "bg-purple-100 dark:bg-purple-800"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              onClick={() => handleSelect(user.uid)}
            >
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "user"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                    👤
                  </div>
                )}
                <span className="text-sm font-medium">
                  {user.displayName || user.email || "Unnamed"}
                </span>
              </div>
              {selectedUsers.includes(user.uid) && (
                <FaCheckCircle className="text-green-500" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className="mt-6 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FaUserCheck />
          {loading ? "Sending..." : "Send Notifications"}
        </button>
      </div>
    </div>
  );
};

export default AdminNotifications;
