import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FaShieldAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

const PayUpiId = () => {
  const [upi, setUpi] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userLoading, setUserLoading] = useState(true);

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const filtered = snap.docs
          .filter(
            (doc) =>
              doc.id !== currentUser?.uid &&
              !doc.data().isGhost &&
              doc.data().upi
          )
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .slice(0, 20);

        setUserList(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleNext = async () => {
    if (!upi || !upi.includes("@")) {
      return toast.error("Enter a valid UPI ID");
    }

    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("upi", "==", upi));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const foundUser = snap.docs[0];
        navigate(`/send/${foundUser.id}`);
      } else {
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGhostProceed = async () => {
    if (!name.trim()) return toast.error("Enter recipient name");

    const ghostId = `ghostupi_${upi.replace(/[^a-zA-Z0-9]/g, "")}`;

    try {
      await setDoc(doc(db, "users", ghostId), {
        name,
        email: `${name}@zapghost.com`,
        upi,
        isGhost: true,
        createdAt: new Date(),
        wallet: 0,
        photoURL: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=upi${ghostId}`,
      });

      navigate(`/send/${ghostId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to proceed");
    }
  };

  return (
    <div className="min-h-screen px-4 mt-12 py-8 bg-white dark:bg-[#0d0d0d] text-center text-gray-800 dark:text-white flex flex-col items-center justify-center">
      <div className="max-w-sm w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Send Money via UPI ID</h2>

        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <FaShieldAlt className="text-green-500" />
          <span>100% Secure • Zap Security Protected</span>
        </div>

        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="Enter UPI ID (e.g. name@bank)"
              value={upi}
              onChange={(e) => setUpi(e.target.value.trim())}
              className="w-full px-4 py-2 mb-4 rounded-md border dark:bg-[#2a2a2a] dark:text-white text-center text-lg tracking-wide"
            />

            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-md mb-4"
            >
              {loading ? "Checking..." : "Next"}
            </button>

            {/* Show user list */}
            <ul className="text-left space-y-2 max-h-60 overflow-y-auto text-sm">
              {userLoading ? (
                [...Array(5)].map((_, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 animate-pulse bg-gray-100 dark:bg-[#2a2a2a] px-3 py-2 rounded-md"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#3a3a3a]" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-24 bg-gray-300 dark:bg-[#3a3a3a] rounded" />
                      <div className="h-2 w-16 bg-gray-300 dark:bg-[#3a3a3a] rounded" />
                    </div>
                  </li>
                ))
              ) : userList.length > 0 ? (
                userList.map((u) => (
                  <li
                    key={u.id}
                    onClick={() => navigate(`/send/${u.id}`)}
                    className="flex items-center gap-3 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] px-3 py-2 rounded-md cursor-pointer transition"
                  >
                    <img
                      src={u.photoURL}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.upi}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-400 text-center py-2">
                  No users found
                </li>
              )}
            </ul>
          </>
        ) : (
          <>
            <p className="text-sm mb-3 text-gray-500">
              UPI ID not found. Enter recipient name to continue:
            </p>
            <input
              type="text"
              placeholder="Recipient Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-md border dark:bg-[#2a2a2a] dark:text-white text-center"
            />

            <button
              onClick={handleGhostProceed}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2"
            >
              Continue <FiChevronRight />
            </button>

            <p className="text-xs mt-3 text-gray-400">UPI: {upi}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PayUpiId;
