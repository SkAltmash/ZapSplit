import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaWallet } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [editField, setEditField] = useState(null); // 'name', 'upi', 'zupPin'
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setUserData(snap.data());
        else toast.error("User data not found");
      } catch (err) {
        toast.error("Failed to load profile");
        console.error(err);
      }
    });
    return () => unsubscribe();
  }, []);

  const openEditModal = (field) => {
    setEditField(field);
    setEditValue(userData[field] || "");
  };

  const closeModal = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!editValue.trim()) return toast.error("Value cannot be empty");
    if (editField === "zupPin" && editValue.length !== 4) {
      return toast.error("PIN must be 4 digits");
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      await updateDoc(doc(db, "users", user.uid), {
        [editField]: editValue,
        updatedAt: new Date(),
      });
      toast.success(`${editField} updated successfully`);
      setUserData((prev) => ({ ...prev, [editField]: editValue }));
      closeModal();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Skeleton loader
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d] px-4">
        <div className="max-w-md w-full p-6 space-y-4 animate-pulse">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mx-auto" />
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 bg-white dark:bg-[#0d0d0d] px-4 py-8 text-gray-800 dark:text-white flex flex-col items-center">
      <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] border dark:border-white/10 rounded-2xl shadow-md p-6 relative z-10">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={userData.photoURL}
            alt="avatar"
            className="w-20 h-20 rounded-full mb-2 border"
          />
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{userData.name}</h2>
            <FiEdit2
              onClick={() => openEditModal("name")}
              className="cursor-pointer text-gray-500 hover:text-purple-600"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{userData.email}</p>
        </div>

        {/* Wallet Info */}
        <div className="bg-purple-600 text-white rounded-xl px-4 py-3 flex items-center justify-between mb-5 shadow-md">
          <div className="flex items-center gap-2">
            <FaWallet />
            <span className="text-sm">Wallet Balance</span>
          </div>
          <span className="text-lg font-semibold">₹{userData.wallet}</span>
        </div>

        {/* Info Section */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Mobile</span>
            <span>{userData.mobile}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">UPI ID</span>
            <span className="flex items-center gap-2">
              {userData.upi}
              <FiEdit2
                onClick={() => openEditModal("upi")}
                className="cursor-pointer text-gray-500 hover:text-purple-600"
              />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">ZUP PIN</span>
            <span className="flex items-center gap-2 tracking-widest font-medium">
              {userData.zupPin}
              <FiEdit2
                onClick={() => openEditModal("zupPin")}
                className="cursor-pointer text-gray-500 hover:text-purple-600"
              />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Joined</span>
<span>
  {userData.createdAt && typeof userData.createdAt.toDate === "function"
    ? format(userData.createdAt.toDate(), "PPP p")
    : "-"}
</span>          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
<span>
  {userData.updatedAt && typeof userData.updatedAt.toDate === "function"
    ? format(userData.updatedAt.toDate(), "PPP p")
    : "-"}
</span>          </div>
        </div>

        {/* QR Code */}
        {userData.upi && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scan to Pay via UPI</p>
            <div className="p-4 bg-white dark:bg-[#121212] rounded-md shadow-sm flex justify-center">
              <QRCode value={userData.upi} size={160} />
            </div>
            <p className="text-xs mt-2 text-gray-500">{userData.upi}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {editField && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow-lg w-80"
            >
              <h3 className="text-lg font-semibold mb-3 capitalize">Edit {editField}</h3>
              <input
                type={editField === "zupPin" ? "password" : "text"}
                maxLength={editField === "zupPin" ? 4 : 50}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded border dark:bg-[#2a2a2a] dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
