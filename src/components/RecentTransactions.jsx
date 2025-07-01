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
  FiLoader,
} from "react-icons/fi";

const PAGE_SIZE = 10;

const typeIcon = {
  add: <FiPlusCircle className="text-green-500 text-xl" />,
  send: <FiArrowUpRight className="text-red-500 text-xl" />,
  receive: <FiArrowDownLeft className="text-yellow-500 text-xl" />,
};

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const user = auth.currentUser;

  const fetchTransactions = async (isFirst = false) => {
    if (!user) return;

    try {
      isFirst ? setLoading(true) : setMoreLoading(true);

      const baseRef = collection(db, "users", user.uid, "transactions");
      let q;

      if (filterType !== "all") {
        q = query(
          baseRef,
          where("type", "==", filterType),
          orderBy("timestamp", "desc"),
          ...(lastDoc ? [startAfter(lastDoc)] : []),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          baseRef,
          orderBy("timestamp", "desc"),
          ...(lastDoc ? [startAfter(lastDoc)] : []),
          limit(PAGE_SIZE)
        );
      }

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
              className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] border rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                {typeIcon[tx.type] || (
                  <FiPlusCircle className="text-gray-400 text-xl" />
                )}
                <div>
                  <p className="font-medium">{tx.note || tx.type}</p>
                  <p className="text-xs text-gray-500">
                    {tx.upi} • {formatDate(tx.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    tx.amount < 0
                      ? "text-red-500"
                      : tx.type === "receive"
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
