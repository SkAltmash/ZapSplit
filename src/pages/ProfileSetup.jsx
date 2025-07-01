import { useState } from "react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const avatarOptions = [
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zupp1",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zupp2",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zappie",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Splittron",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zuzzu",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=ZuppMaster",
];

const ProfileSetup = () => {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");
  const [upi, setUpi] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !upi) return toast.error("All fields are required");
    if (!user) return toast.error("User not logged in");

    setLoading(true);
    try {
      // Update Firebase Auth
      await updateProfile(user, {
        displayName: name,
        photoURL: selectedAvatar,
      });

      // Save to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          email: user.email,
          upi,
          wallet: 0.00,    
          photoURL: selectedAvatar,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      toast.success("Profile updated!");
      navigate("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 text-center">
          Complete Your Profile
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              UPI ID
            </label>
            <input
              type="text"
              required
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Choose an Avatar
            </label>
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Avatar ${index + 1}`}
                  onClick={() => setSelectedAvatar(url)}
                  className={`cursor-pointer rounded-full w-20 h-20 p-1 border-4 transition ${
                    selectedAvatar === url
                      ? "border-purple-500"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-md transition ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
