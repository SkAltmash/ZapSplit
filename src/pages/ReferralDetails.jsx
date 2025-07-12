import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Loader, RefreshCw, Copy, Mail, User, Share2, CheckCircle, Phone } from "lucide-react";
import toast from "react-hot-toast";

const ReferralDetails = () => {
  const [referralCode, setReferralCode] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const generateReferralCode = () =>
    "ZAP" + Math.floor(1000 + Math.random() * 9000);

  const fetchReferralCode = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, { referralCode: generateReferralCode() });
    }

    let code = snap.data()?.referralCode;

    if (!code) {
      code = generateReferralCode();
      await updateDoc(userRef, { referralCode: code });
    }

    setReferralCode(code);
  };

  const fetchInvitedUsers = async () => {
    setLoadingUsers(true);

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("invitedBy", "==", referralCode));
    const invitedSnap = await getDocs(q);

    const invited = invitedSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setInvitedUsers(invited);
    setLoadingUsers(false);
  };

  const init = async () => {
    setLoading(true);
    await fetchReferralCode();
    await fetchInvitedUsers();
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const shareLink = `https://zapsplit.netlify.app/signup?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Referral link copied to clipboard!");
  };

  const handleClaim = async (invitedUser) => {
    
    if (invitedUser.rewardClaimed) {
      toast.error("Reward already claimed for this user.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const invitedUserRef = doc(db, "users", invitedUser.id);
    const currentUserRef = doc(db, "users", currentUser.uid);

    try {
      await updateDoc(invitedUserRef, { rewardClaimed: true });
      await updateDoc(currentUserRef, { wallet: increment(201) });

      await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
        message: `You earned ₹201 for inviting ${invitedUser.name || invitedUser.email}`,
        seen: false,
        createdAt: serverTimestamp(),
      });
      
      await addDoc(collection(db, "users", currentUser.uid, "transactions"), {
        type: "reward",
        userId: invitedUser.id,
        userName: invitedUser.name || invitedUser.email,
        userEmail: invitedUser.email || "No email", 
        photoURL: invitedUser.photoURL || `https://ui-avatars.com/api/?name=${invitedUser.name || "User"}`,
        amount: 201,    
        note: `Referral reward from ${invitedUser.name || invitedUser.email}`,
        timestamp: serverTimestamp(),
        status: "success",
      });

      toast.success("₹201 reward claimed!");
      fetchInvitedUsers(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] mt-15 text-black dark:text-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] mt-16 text-black dark:text-white p-4 sm:p-6 rounded-xl shadow-lg max-w-md mx-auto space-y-6 relative">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Share2 className="w-6 h-6" /> Zap Referral
      </h2>

      <p className="text-gray-600 dark:text-gray-400 text-sm">
        Earn rewards by inviting friends to ZapSplit!
      </p>

      <div className="bg-gray-100 dark:bg-[#2a2a2a] p-4 rounded-lg space-y-2">
        <div className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" /> 1. Invite a friend with your referral code
        </div>
        <div className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" /> 2. They make their first payment
        </div>
        <div className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" /> 3. You earn <span className="font-bold">₹201</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="text-purple-600 font-semibold">Your referral code: {referralCode}</p>
          <p>Share this code with your friends to earn rewards!</p>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Share your referral link:
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={copyLink}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              "Join me on ZapSplit: " + shareLink
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center gap-1"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </a>

          <a
            href={`mailto:?subject=Join me on ZapSplit&body=Here is my referral link: ${shareLink}`}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" /> Invited Users
          </h3>
          <button
            onClick={fetchInvitedUsers}
            className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <RefreshCw className={`w-4 h-4 ${loadingUsers && "animate-spin"}`} /> Refresh
          </button>
        </div>

        {loadingUsers ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-2 items-center animate-pulse bg-gray-100 dark:bg-gray-800 p-2 rounded"
              >
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {invitedUsers.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No invited users yet.
              </div>
            ) : (
              invitedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex gap-2 items-center bg-gray-50 dark:bg-[#2a2a2a] p-2 rounded justify-between"
                >
                  <div className="flex gap-2 items-center">
                    <img
                      src={
                        user.photoURL ||
                        `https://ui-avatars.com/api/?name=${user.name || "User"}`
                      }
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-sm">{user.name || "Unnamed"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email || "No email"}
                      </div>
                    </div>
                  </div>

                  {user.rewardClaimed ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(user)}
                      className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                    >
                      Claim ₹201
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDetails;
