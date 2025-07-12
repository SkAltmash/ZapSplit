import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import {
  FiPlusCircle,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiUsers,
  FiLoader,
  FiRepeat,
  FiGift,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

const typeIcon = {
  add: <FiPlusCircle className="text-green-500 text-xl" />,
  send: <FiArrowUpRight className="text-red-500 text-xl" />,
  receive: <FiArrowDownLeft className="text-yellow-500 text-xl" />,
  split: <FiUsers className="text-blue-500 text-xl" />,
  "split-payment": <FiUsers className="text-purple-500 text-xl" />,
  "split-receive": <FiUsers className="text-purple-500 text-xl" />,
  paylater: <FiArrowDownLeft className="text-green-500 text-xl" />,
  "paylater-payment": <FiArrowUpRight className="text-orange-500 text-xl" />,
  "paylater-extend": <FiRepeat className="text-blue-500 text-xl" />,
  reward: <FiGift className="text-pink-500 text-xl" />,
};

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const navigate = useNavigate();
  const user = auth.currentUser;

  const fetchTransactions = async (isFirst = false) => {
    if (!user) return;
    try {
      isFirst ? setLoading(true) : setMoreLoading(true);

      const baseRef = collection(db, "users", user.uid, "transactions");

      let q = query(baseRef, orderBy("timestamp", "desc"));

      if (filterType !== "all") {
        q = query(
          baseRef,
          where("type", "==", filterType),
          orderBy("timestamp", "desc")
        );
      }

      if (!isFirst && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(PAGE_SIZE));

      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setTransactions((prev) => (isFirst ? data : [...prev, ...data]));
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.size === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  useEffect(() => {
    setTransactions([]);
    setLastDoc(null);
    setHasMore(true);
    fetchTransactions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const formatDate = (timestamp) =>
    timestamp?.toDate?.()?.toLocaleString("en-IN") || "—";

  const handleClick = (tx) => {
    if (
      tx.type === "paylater-payment" ||
      tx.type === "paylater" 
    ) {
      navigate(`/paylater-txn/${tx.id}`);
    } else {
      navigate(`/transaction/${tx.id}`, { state: tx });
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Recent Transactions</h3>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-md border dark:bg-[#1a1a1a] dark:text-white text-sm"
        >
          <option value="all">All</option>
          <option value="add">Add</option>
          <option value="send">Send</option>
          <option value="receive">Receive</option>
          <option value="split">Split (Initiator)</option>
          <option value="split-payment">Split (Paid by you)</option>
          <option value="split-receive">Split (Received by you)</option>
          <option value="paylater">PayLater (Credit)</option>
          <option value="paylater-payment">PayLater (Repayment)</option>
          <option value="paylater-extend">PayLater (Extended)</option>
          <option value="reward">Reward</option>
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
        <div className="space-y-0 flex flex-col gap-1">
          {transactions.map((tx, index) => {
            const isFirst = index === 0;
            const isLast = index === transactions.length - 1;

            return (
              <div
                key={tx.id}
                onClick={() => handleClick(tx)}
                className={`flex items-center justify-between p-4 border shadow-sm hover:shadow-md transition cursor-pointer
                  ${tx.split === true
                    ? "bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600"
                    : tx.type === "reward"
                    ? "bg-pink-50 dark:bg-pink-900 border-pink-300 dark:border-pink-600"
                    : "bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-white/10"}
                  ${isFirst ? "rounded-t-xl" : ""}
                  ${isLast ? "rounded-b-xl" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  {typeIcon[tx.type] || (
                    <FiPlusCircle className="text-gray-400 text-xl" />
                  )}
                  <div>
                    <p className="font-medium truncate max-w-[200px]">
                      {tx.note || tx.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.to || tx.from || tx.email || "—"} •{" "}
                      {formatDate(tx.timestamp)}
                    </p>

                    {tx.type === "paylater" && (
                      <p className="text-xs text-green-600">
                        PayLater credit received
                      </p>
                    )}

                    {tx.type === "paylater-payment" && (
                      <p className="text-xs text-orange-500">
                        Paid towards PayLater
                      </p>
                    )}

                    {tx.type === "paylater-extend" && (
                      <p className="text-xs text-blue-500">
                        PayLater due extended
                      </p>
                    )}

                    {tx.type === "reward" && (
                      <p className="text-xs text-pink-600 dark:text-pink-300">
                         Reward received
                      </p>
                    )}

                    {tx.split === true && (
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        Split among {tx.participants?.length || "multiple"} people
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-lg font-semibold flex flex-col items-end w-full">
                  <p
                    className={`text-sm font-semibold ${
                      tx.amount < 0
                        ? "text-red-500"
                        : tx.type === "receive" ||
                          tx.type === "split-receive" ||
                          tx.type === "paylater" ||
                          tx.type === "reward"
                        ? "text-green-500"
                        : "text-green-500"
                    }`}
                  >
                    {tx.amount < 0 ? "-" : "+"}₹{Math.abs(tx.amount)}
                  </p>
                  {tx.status && (
                    <p
                      className={`text-xs mt-0.5 font-medium ${
                        tx.status === "success"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchTransactions(false)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            disabled={moreLoading}
          >
            {moreLoading ? (
              <span className="flex items-center gap-2">
                <FiLoader className="animate-spin" /> Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;