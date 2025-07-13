import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiShield,
  FiLoader,
  FiBell,
  FiEdit,
  FiCheck,
  FiX,
  FiClock,
} from "react-icons/fi";

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editWallet, setEditWallet] = useState(0);
  const [editCreditLimit, setEditCreditLimit] = useState(0);
  const [notifMessage, setNotifMessage] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [txLastDoc, setTxLastDoc] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txHasMore, setTxHasMore] = useState(true);

  const TX_PAGE_SIZE = 5;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        navigate("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.data();
      if (data?.role === "admin") setIsAdmin(true);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin || !id) return;
    fetchUser();
  }, [isAdmin, id]);

  const fetchUser = async () => {
    setLoading(true);
    const snap = await getDoc(doc(db, "users", id));
    if (snap.exists()) {
      const data = snap.data();
      setUser({ id: snap.id, ...data });
      setEditWallet(data.wallet || 0);
      setEditCreditLimit(data.creditLimit || 0);
      fetchTransactions();
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    if (!txHasMore) return;
    setTxLoading(true);

    const q = query(
      collection(db, "users", id, "transactions"),
      orderBy("timestamp", "desc"),
      ...(txLastDoc ? [startAfter(txLastDoc)] : []),
      limit(TX_PAGE_SIZE)
    );

    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTransactions((prev) => [...prev, ...data]);
    setTxLastDoc(snap.docs[snap.docs.length - 1]);
    setTxHasMore(snap.docs.length === TX_PAGE_SIZE);
    setTxLoading(false);
  };

  const saveChanges = async () => {
    await updateDoc(doc(db, "users", id), {
      wallet: Number(editWallet),
      creditLimit: Number(editCreditLimit),
      updatedAt: serverTimestamp(),
    });
    setUser((prev) => ({
      ...prev,
      wallet: Number(editWallet),
      creditLimit: Number(editCreditLimit),
    }));
    setEditing(false);
  };

  const sendNotification = async () => {
    if (!notifMessage.trim()) return;
    await addDoc(collection(db, "users", id, "notifications"), {
      message: notifMessage,
      seen: false,
      createdAt: serverTimestamp(),
    });
    setNotifMessage("");
  };

  const Skeleton = () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
      ))}
    </div>
  );

  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FiLoader className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        You are not authorized to view this page.
      </div>
    );
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-1 text-sm text-purple-600"
        >
          <FiArrowLeft /> Back to Users
        </button>

        <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg shadow space-y-3">
          <div className="flex gap-4 items-center">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || "User"}`}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-lg font-bold">{user.name || "No Name"}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">UID: {user.id}</p>
              <p className="text-xs">Role: {user.role || "user"}</p>
            </div>
          </div>

          <div>
            {editing ? (
              <div className="space-y-2">
                <label>
                  Wallet:{" "}
                  <input
                    type="number"
                    value={editWallet}
                    onChange={(e) => setEditWallet(e.target.value)}
                    className="ml-2 px-1 py-0.5 border rounded dark:bg-black dark:text-white w-24"
                  />
                </label>
                {user.payLaterEnabled && (
                  <label>
                    Credit Limit:{" "}
                    <input
                      type="number"
                      value={editCreditLimit}
                      onChange={(e) => setEditCreditLimit(e.target.value)}
                      className="ml-2 px-1 py-0.5 border rounded dark:bg-black dark:text-white w-24"
                    />
                  </label>
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={saveChanges} className="px-3 py-1 bg-green-500 text-white rounded flex items-center gap-1 text-sm">
                    <FiCheck /> Save
                  </button>
                  <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-300 text-black rounded flex items-center gap-1 text-sm">
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="px-3 py-1 bg-purple-600 text-white rounded flex items-center gap-1 text-sm">
                <FiEdit /> Edit Wallet & Credit
              </button>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-md font-semibold flex gap-1 items-center">
              <FiShield /> Details
            </h4>
            <ul className="text-sm space-y-1">
              <li>Wallet: ₹{user.wallet}</li>
              <li>UPI: {user.upi || "—"}</li>
              {user.payLaterEnabled && (
                <>
                  <li>PayLater: ✅ Enabled</li>
                  <li>Credit Limit: ₹{user.creditLimit}</li>
                  <li>Used Credit: ₹{user.usedCredit}</li>
                  <li>Status: {user.payLaterStatus}</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 flex gap-1 items-center">
            <FiBell /> Send Notification
          </h3>
          <textarea
            rows="2"
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
            placeholder="Write a message…"
            className="w-full p-2 rounded border dark:bg-[#0f0f0f] dark:text-white"
          />
          <button
            onClick={sendNotification}
            className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Send
          </button>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 flex gap-1 items-center">
            <FiClock /> Transactions
          </h3>
          {transactions.length === 0 && txLoading ? (
            <Skeleton />
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-500">No transactions</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {transactions.map((tx) => (
                <li key={tx.id} className="border-b pb-1">
                  <span className="font-medium">{tx.note || tx.type}</span> — ₹{tx.amount} —
                  <span className="text-xs text-gray-400 ml-1">
                    {tx.timestamp?.toDate()?.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {txHasMore && (
            <button
              onClick={fetchTransactions}
              disabled={txLoading}
              className="mt-3 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
            >
              {txLoading ? "Loading…" : "Load More"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
