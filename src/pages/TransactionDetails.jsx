import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FiArrowLeft } from "react-icons/fi";
import { format } from "date-fns";
import { motion } from "framer-motion";

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [txn, setTxn] = useState(state || null);
  const [loading, setLoading] = useState(!state);

  useEffect(() => {
    const fetchTxn = async () => {
      if (!txn) {
        const user = auth.currentUser;
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid, "transactions", id));
        if (snap.exists()) {
          setTxn({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      }
    };
    fetchTxn();
  }, [id, txn]);

  if (loading || !txn) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        <p>Loading transaction details...</p>
      </div>
    );
  }

  const isFailed = txn.status === "failed";
  const isSent = txn.type === "send";

  return (
    <div className="min-h-screen px-4 mt-12 py-10 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h2 className="text-lg font-bold">Transaction Details</h2>
        </div>

        {/* Status + Amount Highlight */}
        <div className="text-center mb-6">
          <h3
            className={`text-2xl font-bold ${
              isFailed ? "text-red-500" : "text-green-500"
            }`}
          >
            {isFailed ? "Failed Transaction" : "Transaction Successful"}
          </h3>
          <p className="text-3xl font-extrabold mt-2">
            ₹{Math.abs(txn.amount)}
          </p>
        </div>

        {/* Details List */}
        <div className="text-sm space-y-4">
          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-400">Status:</span>{" "}
            <span className={`font-semibold ${isFailed ? "text-red-500" : "text-green-600"}`}>
              {txn.status}
            </span>
          </p>

          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-400">
              {isSent ? "To" : "From"}:
            </span>{" "}
            <span className="font-medium">{txn.to || txn.from}</span>
          </p>

          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-400">Note:</span>{" "}
            {txn.note || <span className="italic text-gray-400">No note</span>}
          </p>

          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-400">Date & Time:</span>{" "}
            {txn.timestamp
              ? format(new Date(txn.timestamp?.seconds * 1000), "dd MMM yyyy, hh:mm a")
              : "N/A"}
          </p>

          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-400">Transaction ID:</span>{" "}
            <span className="text-xs text-purple-600 dark:text-purple-400 break-all">{txn.id}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionDetails;
