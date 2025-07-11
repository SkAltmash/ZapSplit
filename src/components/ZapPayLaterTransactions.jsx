import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const ZupPayLaterTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const ref = collection(db, "users", user.uid, "paylaterTransactions");
      let q = query(ref, orderBy("timestamp", "desc"));

      if (filterStatus !== "all") {
        q = query(
          ref,
          where("status", "==", filterStatus),
          orderBy("timestamp", "desc")
        );
      }

      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus]);

  const formatDate = (timestamp) =>
    timestamp?.toDate()?.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) || "—";

  return (
    <div className="mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-700">
          ZupPayLater Transactions
        </h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-md border dark:bg-[#1a1a1a] dark:text-white text-sm"
        >
          <option value="all">All</option>
          <option value="due">Due</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-[#1a1a1a] animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No transactions found.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {transactions.map((txn, index) => {
            const isFirst = index === 0;
            const isLast = index === transactions.length - 1;

            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/paylater-txn/${txn.id}`)}
                className={`border p-4 shadow flex justify-between items-center cursor-pointer
                ${
                txn.status === "due"
                 ? "bg-red-100/30 dark:bg-red-900/30"
                 : txn.status === "paid"
                  ? "bg-green-100/30 dark:bg-green-900/30"
                  : ""
                 }                
                 ${isFirst ? "rounded-t-lg" : ""}
                  ${isLast ? "rounded-b-lg" : ""}
                `}
              >
                <div>
                  <p className="text-lg font-medium text-green-600">
                    ₹{txn.amount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {txn.note}
                  </p>
                  <p className="text-xs text-gray-500">
                    Borrowed on: {formatDate(txn.timestamp)}
                  </p>
                  <p className="text-xs text-red-500">
                    Due Date: {formatDate(txn.dueDate)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        txn.status === "due"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {txn.status === "due" ? (
                        <span className="flex items-center gap-1">
                          <FiAlertCircle /> Due
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FiCheckCircle /> Paid
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ZupPayLaterTransactions;
