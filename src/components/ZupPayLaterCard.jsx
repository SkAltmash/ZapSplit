import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

const ZupPayLaterCard = () => {
  const [loading, setLoading] = useState(true);
  const [payLaterEnabled, setPayLaterEnabled] = useState(false);
  const [creditLimit, setCreditLimit] = useState(30000);
  const [usedCredit, setUsedCredit] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayLater = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.payLaterEnabled) {
            setPayLaterEnabled(true);
            setCreditLimit(data.creditLimit || 30000);
            setUsedCredit(data.usedCredit || 0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch PayLater info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayLater();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow p-6 animate-pulse h-40">
        <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 mb-2 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 mb-1 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!payLaterEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold">Get up to ₹30,000 ZupPayLater</h3>
        <p className="mt-2 text-sm">
          Shop, pay bills, and split payments instantly — repay within 30 days!
        </p>

        <ul className="mt-4 space-y-1 text-sm list-disc list-inside">
          <li>Instant approval</li>
          <li>No paperwork</li>
          <li>Flexible repayment</li>
        </ul>

        <button
          onClick={() => navigate("/apply-paylater")}
          className="mt-4 px-4 py-2 bg-white text-purple-700 rounded hover:bg-purple-100 transition"
        >
          Apply Now <FiArrowRight className="inline ml-1" />
        </button>
      </motion.div>
    );
  }

  const availableCredit = creditLimit - usedCredit;

  return (
   <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative bg-gradient-to-br from-white via-gray-50 to-purple-50 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1f1f1f] border border-purple-100 dark:border-white/10 p-6 rounded-2xl shadow-xl overflow-hidden"
>
  {/* Header */}
  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2 mb-4">
    <FiTrendingUp className="text-2xl" /> ZupPayLater
  </h3>

  {/* Credit Summary */}
  <div className="space-y-3">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">Credit Limit</span>
      <span className="font-semibold text-gray-800 dark:text-white">
        ₹{creditLimit.toLocaleString()}
      </span>
    </div>

    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">Used</span>
      <span className="font-semibold text-yellow-600">
        ₹{usedCredit.toLocaleString()}
      </span>
    </div>

    <div className="flex justify-between text-sm mt-2">
      <span className="text-gray-600 dark:text-gray-400">Available</span>
      <span className="font-semibold text-green-600">
        ₹{availableCredit.toLocaleString()}
      </span>
    </div>
  </div>

  {/* Decorative Gradient Bar */}
  <div className=" mt-2 absolute left-0 right-0 bottom-14 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-50"></div>

  {/* Fixed Button */}
  <div className="absolute left-0 right-0 bottom-0">
    <button
      onClick={() => navigate("/zap-pay-later")}
      className="w-full px-4 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-b-2xl transition"
    >
      Repay Now
    </button>
  </div>
</motion.div>

  );
};

export default ZupPayLaterCard;
