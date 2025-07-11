import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  FiLoader,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const PayLaterTransactionDetails = () => {
  const { txnId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);

  const fetchTransaction = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid, "paylaterTransactions", txnId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("Transaction not found.");
        navigate(-1);
        return;
      }

      setTransaction({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch transaction.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

 

  useEffect(() => {
    fetchTransaction();
    // eslint-disable-next-line
  }, []);

  const formatDate = (timestamp) =>
    timestamp?.toDate()?.toLocaleString("en-IN") || "—";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-black">
        <FiLoader className="animate-spin text-2xl text-purple-600" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <p>Transaction not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
        >
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#eee] h-screen p-4 dark:bg-black">
        <div className="max-w-xl mx-auto mt-15 p-6 bg-white dark:bg-[#1a1a1a] dark:text-white rounded-xl shadow-lg space-y-4 relative">
      <button
        onClick={() => navigate(-1)}
        className="text-purple-600 text-sm flex items-center gap-1"
      >
        <FiArrowLeft /> Back
      </button>

      {transaction.status === "due" ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow"
        >
          <FiAlertTriangle className="text-yellow-600 text-xl" />
          <p className="text-yellow-800 dark:text-yellow-300 font-medium">
            Payment Due
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900 rounded-lg shadow"
        >
          <FiCheckCircle className="text-green-600 text-xl" />
          <p className="text-green-800 dark:text-green-300 font-medium">
            Paid
          </p>
        </motion.div>
      )}

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Amount:</span>{" "}
          <span className="text-green-600">₹{transaction.amount}</span>
        </p>
        <p>
          <span className="font-medium">Note:</span> {transaction.note || "—"}
        </p>
        <p>
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`${
              transaction.status === "due"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {transaction.status}
          </span>
        </p>
        <p>
          <span className="font-medium">Borrowed On:</span>{" "}
          {formatDate(transaction.timestamp)}
        </p>
        <p>
          <span className="font-medium">Due Date:</span>{" "}
          {formatDate(transaction.dueDate)}
        </p>
        
      </div>

      {transaction.status === "due" && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-3 rounded shadow"
          >
            ⚠️ Paying your dues on time improves your credit score and avoids
            bad impact on your account.
          </motion.div>

          <button
            onClick={(e) => {
            e.stopPropagation();
           navigate(`/pay-due/${transaction.id}`)}}
            className="w-full mt-6 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-lg font-medium shadow"
          >
          
            Pay Now
          </button>
        </>
      )}
    </div>
    </div>
  );
};

export default PayLaterTransactionDetails;
