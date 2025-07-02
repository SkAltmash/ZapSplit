import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { FiArrowLeft } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

const SendToUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setCurrentUser(u);

        try {
          const snap = await getDoc(doc(db, "users", userId));
          if (snap.exists()) {
            const rec = { id: snap.id, ...snap.data() };
            setRecipient(rec);

            const txnRef = collection(db, "users", u.uid, "transactions");
            const q = query(txnRef, orderBy("timestamp", "asc"));
            const snapTxn = await getDocs(q);

            const filtered = snapTxn.docs
              .map((doc) => doc.data())
              .filter((txn) => txn.to === rec.email || txn.from === rec.email);

            setTransactions(filtered);
          } else {
            navigate("/send");
          }
        } catch (err) {
          console.error("Error fetching data", err);
        }
      }
    });

    return () => unsub();
  }, [userId, navigate]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transactions]);

  if (!recipient || !currentUser) return <div className="p-6">Loading...</div>;

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-gray-100 dark:bg-[#0d0d0d] mt-12">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1a1a1a] shadow-md">
        <button onClick={() => navigate("/send")}>
          <FiArrowLeft className="text-xl" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center overflow-hidden">
            {recipient.photoURL ? (
              <img
                src={recipient.photoURL}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{recipient.name?.[0]}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">{recipient.name}</p>
            <p className="text-xs text-gray-500">{recipient.email}</p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
      >
        {transactions.map((txn, i) => {
          const isSent = txn.type === "send";
          const isFailed = txn.status === "failed";

          return (
           <div
  key={i}
  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
>
  <div
    onClick={() => navigate(`/transaction/${txn.id}`, { state: txn })}
    className={`cursor-pointer rounded-xl px-4 py-2 max-w-[70%] text-sm shadow border transition-transform hover:scale-[1.02] ${
      isFailed
        ? "bg-red-100 border-red-400 text-red-700 dark:bg-red-900 dark:text-red-200"
        : isSent
        ? "bg-purple-600 text-white border-purple-500"
        : "bg-gray-200 dark:bg-[#2a2a2a] text-gray-800 dark:text-white border-transparent"
    }`}
  >
    <p className="font-bold">₹{Math.abs(txn.amount)}</p>
    {txn.note && (
      <p className="text-xs mt-1 opacity-80 break-words">{txn.note}</p>
    )}
    <p className="text-[10px] text-right mt-1 opacity-60">
      {formatDistanceToNow(new Date(txn.timestamp?.toDate?.()), {
        addSuffix: true,
      })}
    </p>
  </div>
</div>

          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white dark:bg-[#1a1a1a] ">
        <button
          onClick={() => navigate(`/pay/${recipient.id}`)}
          className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 max-w-xs mx-auto transition duration-200 flex items-center justify-center gap-2"
        >
          Pay {recipient.name?.split(" ")[0] || "User"}
        </button>
      </div>
    </div>
  );
};

export default SendToUser;
