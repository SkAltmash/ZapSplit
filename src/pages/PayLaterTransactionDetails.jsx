import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  FiLoader,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiCalendar,
  FiRepeat,
} from "react-icons/fi";
import toast from "react-hot-toast";

const PayLaterTransactionDetails = () => {
  const { txnId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [interest, setInterest] = useState(0);
  const [daysDiff, setDaysDiff] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
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

        const txn = { id: snap.id, ...snap.data() };
        setTransaction(txn);

        if (txn.status === "due") {
          const now = new Date();
          const due = txn.dueDate?.toDate?.() || new Date(txn.dueDate);
          const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            setIsOverdue(true);
            setDaysDiff(Math.abs(diffDays));
            const interestAmount = Math.ceil(
              txn.amount * 0.01 * Math.abs(diffDays)
            ); // 1%/day
            setInterest(interestAmount);
          } else {
            setDaysDiff(diffDays);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch transaction.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
    // eslint-disable-next-line
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    if (typeof timestamp?.toDate === "function") {
      return timestamp.toDate().toLocaleString("en-IN");
    }

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString("en-IN");
    }

    const parsed = new Date(timestamp);
    if (!isNaN(parsed)) {
      return parsed.toLocaleString("en-IN");
    }

    return "—";
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-black">
        <FiLoader className="animate-spin text-3xl text-purple-600" />
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

  const timeline = [
    {
      label: "Borrowed",
      date: formatDate(transaction.timestamp),
      icon: <FiClock />,
    },
    {
      label: "Due",
      date: formatDate(transaction.dueDate),
      icon: <FiCalendar />,
    },
    ...(transaction?.extensions || []).map((ext, idx) => ({
      label: `Extended (${idx + 1})`,
      date: formatDate(ext.extendedAt),
      icon: <FiRepeat />,
    })),
    ...(transaction.status === "paid"
      ? [
          {
            label: "Paid",
            date: "✔ Completed",
            icon: <FiCheckCircle />,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white dark:from-black dark:to-gray-900 min-h-screen p-4">
      <div className="max-w-xl mx-auto mt-15 p-6 bg-white dark:bg-[#1a1a1a] dark:text-white rounded-2xl shadow-2xl space-y-6 relative">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-600 text-sm flex items-center gap-1 mb-2"
        >
          <FiArrowLeft /> Back
        </button>

        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex items-center gap-3 p-3 rounded-lg shadow transition
            ${
              transaction.status === "due"
                ? "bg-yellow-100 dark:bg-yellow-900"
                : "bg-green-100 dark:bg-green-900"
            }`}
        >
          {transaction.status === "due" ? (
            <>
              <FiAlertTriangle className="text-yellow-600 text-2xl" />
              <p className="text-yellow-800 dark:text-yellow-300 font-medium text-lg">
                Payment Due
              </p>
            </>
          ) : (
            <>
              <FiCheckCircle className="text-green-600 text-2xl" />
              <p className="text-green-800 dark:text-green-300 font-medium text-lg">
                Paid
              </p>
            </>
          )}
        </motion.div>

        <div className="space-y-2 text-base">
          <p>
            <span className="font-medium">Amount:</span>{" "}
            <span className="text-green-600 font-semibold text-lg">
              ₹{transaction.amount}
            </span>
          </p>
          <p>
            <span className="font-medium">Note:</span>{" "}
            {transaction.note || "—"}
          </p>

          {isOverdue && (
            <p className="text-red-600 font-medium">
              Overdue by {daysDiff} day(s) — Interest: ₹{interest}
            </p>
          )}
          {!isOverdue && transaction.status === "due" && (
            <p className="text-green-600 font-medium">
              {daysDiff} day(s) left to pay
            </p>
          )}
        </div>

        <div className="mt-8">
          <h4 className="text-md font-semibold mb-4">Timeline</h4>
          <div className="relative pl-4 border-l-2 border-purple-400 space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {transaction.status === "due" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-red-50 dark:bg-red-900 p-3 rounded shadow text-xs text-red-700 dark:text-red-300"
          >
            Timely repayment avoids additional interest & keeps your account
            healthy.
          </motion.div>
        )}

        {transaction.status === "due" && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate(`/pay-due/${transaction.id}`)}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-md font-semibold shadow"
            >
              Pay Now
            </button>

            <button
              onClick={() => navigate(`/extend-due/${transaction.id}`)}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-md font-semibold shadow"
            >
              Extend
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayLaterTransactionDetails;
