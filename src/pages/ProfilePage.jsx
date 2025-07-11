import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaWallet } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { updateProfile } from "firebase/auth";

const avatarOptions = [
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zupp1",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zupp2",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zappie",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Splittron",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zuzzu",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=ZuppMaster",
];

const CLOUD_NAME = "dnaftbdo8";
const UPLOAD_PRESET = "unsigned_zapsplit";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState("avatars");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setSelectedAvatar(data.photoURL || "");
        } else {
          toast.error("User data not found");
        }
      } catch {
        toast.error("Failed to load profile");
      }
    });
    return () => unsubscribe();
  }, []);

  const openEditModal = (field) => {
    if (field === "photoURL") {
      setAvatarModalOpen(true);
      return;
    }
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
      toast.success(`${editField} updated`);
      setUserData((prev) => ({ ...prev, [editField]: editValue, updatedAt: new Date() }));
      closeModal();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (url) => {
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: url,
        updatedAt: new Date(),
      });
      updateProfile(user, { photoURL: url });
      setUserData((prev) => ({ ...prev, photoURL: url, updatedAt: new Date() }));
      setSelectedAvatar(url);
      toast.success("Profile photo updated!");
      setAvatarModalOpen(false);
    } catch {
      toast.error("Failed to update photo");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      const url = res.data.secure_url;
      await handleAvatarChange(url);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 flex flex-col items-center px-4 py-8 text-gray-800 dark:text-white">
      <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-md p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={userData.photoURL || "https://via.placeholder.com/80"}
              alt="avatar"
              className="w-20 h-20 rounded-full mb-2 border cursor-pointer"
              onClick={() => openEditModal("photoURL")}
            />
            <FiEdit2
              onClick={() => openEditModal("photoURL")}
              className="absolute bottom-1 right-1 bg-white rounded-full p-1 text-purple-600 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{userData.name}</h2>
            <FiEdit2
              onClick={() => openEditModal("name")}
              className="cursor-pointer text-gray-500 hover:text-purple-600"
            />
          </div>
          <p className="text-sm text-gray-500">{userData.email}</p>
        </div>

        <div className="bg-purple-600 text-white rounded-xl px-4 py-3 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaWallet />
            <span className="text-sm">Wallet</span>
          </div>
          <span className="text-lg font-semibold">₹{userData.wallet}</span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Mobile</span>
            <span>{userData.mobile}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">UPI ID</span>
            <span className="flex items-center gap-2">
              {userData.upi}
              <FiEdit2
                onClick={() => openEditModal("upi")}
                className="cursor-pointer text-gray-500 hover:text-purple-600"
              />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">ZUP PIN</span>
            <span className="flex items-center gap-2 tracking-widest">
              {userData.zupPin}
              <FiEdit2
                onClick={() => openEditModal("zupPin")}
                className="cursor-pointer text-gray-500 hover:text-purple-600"
              />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Joined</span>
            <span>
              {userData.createdAt?.toDate
                ? format(userData.createdAt.toDate(), "PPP p")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last Updated</span>
            <span>
              {userData.updatedAt?.toDate
                ? format(userData.updatedAt.toDate(), "PPP p")
                : "-"}
            </span>
          </div>
        </div>

        {userData.upi && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 text-center mb-2">Scan to Pay</p>
            <div className="flex justify-center">
              <div className="p-4 bg-white dark:bg-[#121212] rounded shadow">
                <QRCode value={userData.upi} size={160} />
              </div>
            </div>
            <p className="text-xs mt-2 text-center text-gray-500">{userData.upi}</p>
          </div>
        )}
      </div>

      {/* editField modal */}
      <AnimatePresence>
        {editField && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
                  className="px-4 py-2 bg-gray-200 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* avatar modal */}
      <AnimatePresence>
        {avatarModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAvatarModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow-lg w-80 space-y-4"
            >
              <h3 className="text-lg font-semibold">Update Profile Photo</h3>

              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setMode("avatars")}
                  className={`px-3 py-1 rounded text-sm ${
                    mode === "avatars"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  Choose Avatar
                </button>
                <button
                  onClick={() => setMode("upload")}
                  className={`px-3 py-1 rounded text-sm ${
                    mode === "upload"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  Upload
                </button>
              </div>

              {mode === "avatars" && (
                <div className="grid grid-cols-3 gap-2">
                  {avatarOptions.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt="avatar"
                      onClick={() => handleAvatarChange(url)}
                      className={`w-20 h-20 rounded-full cursor-pointer p-1 border transition hover:border-purple-500 ${
                        selectedAvatar === url ? "border-purple-600" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              )}

              {mode === "upload" && (
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="mb-2"
                  />
                  {!uploading && (
                    <p className="text-xs text-gray-500 mb-2"> 
                    Upload your own image as an avatar (recommended size: 200x200 pixels)
                  </p>)}
    
                  {uploading ? (
                    <p className="text-sm text-gray-500">Uploading...</p> 
                
                  ) : (
                    <p className="text-sm text-gray-500"> 
                    Click to upload a custom image
                  </p>
                  )
                  }
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
