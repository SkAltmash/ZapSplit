import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

const PayUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setCurrentUser(u);
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) {
          setRecipient({ id: snap.id, ...snap.data() });
        } else {
          toast.error("User not found");
          navigate("/send");
        }
      }
    });
    return () => unsub();
  }, [userId]);

  const handlePayment = async () => {
    const amountNum = parseFloat(amount);
    if (!recipient || isNaN(amountNum) || amountNum <= 0) {
      return toast.error("Enter a valid amount");
    }

    setLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, "users", currentUser.uid);
        const recipientRef = doc(db, "users", recipient.id);

        const [senderSnap, recipientSnap] = await Promise.all([
          transaction.get(senderRef),
          transaction.get(recipientRef),
        ]);

        if (!senderSnap.exists() || !recipientSnap.exists()) {
          throw new Error("User data missing");
        }

        const senderData = senderSnap.data();
        const recipientData = recipientSnap.data();
        const senderBalance = senderData.wallet || 0;

        if (senderBalance < amountNum) {
          throw new Error("Insufficient balance");
        }

        // Update wallets
        transaction.update(senderRef, {
          wallet: senderBalance - amountNum,
        });

        transaction.update(recipientRef, {
          wallet: (recipientData.wallet || 0) + amountNum,
        });

        const now = new Date();

        // Log transactions
        transaction.set(doc(collection(senderRef, "transactions")), {
          type: "send",
          to: recipient.email,
          amount: -amountNum,
          note: note || "Sent via ZapSplit",
          timestamp: now,
        });

        transaction.set(doc(collection(recipientRef, "transactions")), {
          type: "receive",
          from: currentUser.email,
          amount: amountNum,
          note: note || "Received via ZapSplit",
          timestamp: now,
        });
      });

      toast.success("Payment successful");
      navigate(`/send/${recipient.id}`);
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!recipient) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow-md border">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/send/${recipient.id}`)}>
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

        {/* Input Fields */}
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-md border dark:bg-[#2a2a2a] dark:text-white"
        />

        <input
          type="text"
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-md border dark:bg-[#2a2a2a] dark:text-white"
        />

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700"
        >
          {loading ? "Sending..." : `Pay ₹${amount || 0}`}
        </button>
      </div>
    </div>
  );
};

export default PayUser;
