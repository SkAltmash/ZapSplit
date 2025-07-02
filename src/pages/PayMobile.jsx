import { useState } from "react";
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

const PayMobile = () => {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const handleNext = async () => {
    if (!mobile || mobile.length < 10) return toast.error("Enter valid mobile");

    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("mobile", "==", mobile));
      const snap = await getDocs(q);

      if (!snap.empty) {
        // User found, redirect to chat or send page
        const foundUser = snap.docs[0];
        navigate(`/send/${foundUser.id}`);
      } else {
        // Not found, ask name
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
    if (!name) return toast.error("Enter recipient name");

    const fakeEmail = `${mobile}@zapghost.com`;
    const ghostId = `ghost_${mobile}`;

    try {
      await setDoc(doc(db, "users", ghostId), {
        name,
        email: fakeEmail,
        mobile,
        isGhost: true,
        createdAt: new Date(),
        wallet: 0,
        photoURL: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=ghost${mobile}`,
      });

      navigate(`/send/${ghostId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to proceed");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-white dark:bg-[#0d0d0d] text-center text-gray-800 dark:text-white flex flex-col items-center justify-center">
      <div className="max-w-sm w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Send Money via Mobile</h2>

        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <FaShieldAlt className="text-green-500" />
          <span>100% Secure • Zap Security Protected</span>
        </div>

        {step === 1 ? (
          <>
            <input
              type="tel"
              maxLength={10}
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-md border dark:bg-[#2a2a2a] dark:text-white text-center text-lg tracking-wide"
            />

            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-md"
            >
              {loading ? "Checking..." : "Next"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm mb-3 text-gray-500">
              We couldn't find this mobile. Enter recipient name to continue:
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
          </>
        )}
      </div>
    </div>
  );
};

export default PayMobile;
