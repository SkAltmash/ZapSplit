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
    timestamp?.toDate()?.toLocaleString("en-IN") || "—";

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
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() =>
                navigate(`/transaction/${tx.id}`, {
                  state: tx,
                })
              }
              className={`flex items-center justify-between p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer
                ${
                  tx.split === true
                    ? "bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600"
                    : "bg-white dark:bg-[#1a1a1a]"
                }`}
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
                  {tx.split === true && (
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      👥 Split among{" "}
                      {tx.participants?.length || "multiple"} people
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    tx.amount < 0
                      ? "text-red-500"
                      : tx.type === "receive" ||
                        tx.type === "split-receive"
                      ? "text-yellow-500"
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
          ))}
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
