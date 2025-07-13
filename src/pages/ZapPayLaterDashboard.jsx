import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCreditCard, FiXCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import ZapPayLaterTransactions from "../components/ZapPayLaterTransactions";
const ZapPayLaterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [amountToUse, setAmountToUse] = useState("");
  const navigate = useNavigate();

  const fetchPayLaterData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const d = snap.data();
        setData({
          status: d.payLaterStatus || "not_applied",
          creditLimit: d.creditLimit || 0,
          usedCredit: d.usedCredit || 0,
          wallet: d.wallet || 0,
        });
      } else {
        setData({ status: "not_applied" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseLimit = async () => {
    const amt = parseFloat(amountToUse);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    const available = data.creditLimit - data.usedCredit;

    if (amt > available) {
      toast.error("Amount exceeds available limit.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        usedCredit: increment(amt),
        wallet: increment(amt),
      });
       const txnRef =  await addDoc(collection(db, "users", user.uid, "paylaterTransactions"), {
        amount: amt,
        timestamp: serverTimestamp(),
        note: "Used ZupPayLater credit",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "due",
        type: "credit",
      });
      await updateDoc(txnRef, { id: txnRef.id });


      await addDoc(collection(db, "users", user.uid, "transactions"), {
      amount: amt,
      timestamp: serverTimestamp(),
      note: "ZupPayLater credit",
      status: "success",
      type: "paylater",
      id:txnRef.id,

      });
  


      toast.success(`₹${amt} added to wallet from ZupPayLater!`);
      setAmountToUse("");
      fetchPayLaterData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to use limit.");
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) fetchPayLaterData();
      else navigate("/login");
    });
    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center flex-col justify-center bg-white dark:bg-[#0d0d0d]">
                <iframe src="https://lottie.host/embed/6018fd80-bc9d-4517-82fa-81cdbcdfab46/pGNR5KojX3.lottie"></iframe>

        <p className="text-gray-700 dark:text-white">Checking user…</p>
      </div>
    );
  }

  if (!data || data.status === "not_applied") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow text-center mt-12"
      >
        <h2 className="text-xl font-bold mb-2">ZupPayLater</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You haven’t applied for ZupPayLater yet.
        </p>
        <button
          onClick={() => navigate("/apply-paylater")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Apply Now
        </button>
      </motion.div>
    );
  }

  if (data.status === "rejected") {
    return (
     <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow text-center mt-12"
      >
        <FiXCircle className="text-red-500 text-4xl mx-auto mb-2" />
        <h2 className="text-xl font-bold text-red-500">Application Rejected</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sorry, you’re not eligible for ZupPayLater at this time.
        </p>
        <button
          onClick={() => navigate("/apply-paylater")}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Reapply
        </button>
      </motion.div>
     </>
    );
  }

  if (data.status === "approved") {
    const available = data.creditLimit - data.usedCredit;

   return (
   <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] px-4 py-8 w-screen">
    {window.scrollTo({
     top: 0,
      behavior: 'smooth'
     })}
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-20 bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow space-y-6"
  >
    <h2 className="text-2xl font-bold text-purple-600 mb-4">
      ZupPayLater Summary
    </h2>

    <div className="grid grid-cols-2 gap-4">
      {/* Available */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-xl shadow flex flex-col items-center">
        <h3 className="text-lg font-semibold">Available Credit</h3>
        <p className="text-2xl font-bold mt-2">₹{available}</p>
      </div>

      {/* Used */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow flex flex-col items-center">
        <h3 className="text-lg font-semibold">Used Credit</h3>
        <p className="text-2xl font-bold mt-2">₹{data.usedCredit}</p>
      </div>
    </div>

    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
      Total Limit: ₹{data.creditLimit}
    </p>

    <div className="space-y-2 w-full max-w-[500px] mx-auto">
      <input
        type="number"
        value={amountToUse}
        onChange={(e) => setAmountToUse(e.target.value)}
        placeholder={`Enter amount ≤ ₹${available}`}
        className="px-4 py-2 rounded text-black w-full border border-gray-300 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      />
      <button
        onClick={handleUseLimit}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 shadow"
      >
        Use Limit
      </button>
    </div>

    <div className="mt-6">
    </div>

  </motion.div>
  <ZapPayLaterTransactions />
</div>
);

  }

  return null;
};

export default ZapPayLaterDashboard;
