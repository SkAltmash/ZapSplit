import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const PaymentProcessing = () => {
  const { userId } = useParams();
  const { state } = useLocation(); // amount, note
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState(null);
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [storedPin, setStoredPin] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !state?.amount) return navigate("/");

      const [senderSnap, recipientSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "users", userId)),
      ]);

      if (senderSnap.exists() && recipientSnap.exists()) {
        setRecipient({ id: userId, ...recipientSnap.data() });
        setStoredPin(senderSnap.data().zupPin);
      } else {
        navigate("/payment-result", {
          state: {
            status: "failed",
            reason: "User not found",
            amount: state.amount,
            recipientName: "Unknown",
            recipientId: userId,
          },
        });
      }
    };

    fetchUsers();
  }, [user, userId, state, navigate]);

  const handleConfirm = async () => {
    if (!user || !recipient || !state.amount || !pin) return;
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    setProcessing(true);

    const userRef = doc(db, "users", user.uid);
    const recipientRef = doc(db, "users", userId);
    const txnId = `txn_${Date.now()}`;
    const now = new Date();
    const amount = Number(state.amount);

    try {
      await runTransaction(db, async (transaction) => {
        const senderSnap = await transaction.get(userRef);
        const receiverSnap = await transaction.get(recipientRef);

        if (!senderSnap.exists() || !receiverSnap.exists()) {
          throw new Error("User not found");
        }

        const sender = senderSnap.data();
        const receiver = receiverSnap.data();

        // ✅ PIN check
        if (sender.zupPin !== pin) {
          throw new Error("Incorrect PIN");
        }

        // ✅ Balance check
        if (sender.wallet < amount) {
          throw new Error("Insufficient balance");
        }

        // ✅ Update balances
        transaction.update(userRef, {
          wallet: sender.wallet - amount,
          updatedAt: now,
        });
        transaction.update(recipientRef, {
          wallet: (receiver.wallet || 0) + amount,
          updatedAt: now,
        });

        // ✅ Record sender's transaction
        transaction.set(doc(db, `users/${user.uid}/transactions`, txnId), {
          id: txnId,
          to: userId,
          amount,
          type: "sent",
          createdAt: now,
          note: state.note || "",
        });

        // ✅ Record recipient's transaction
        transaction.set(doc(db, `users/${userId}/transactions`, txnId), {
          id: txnId,
          from: user.uid,
          amount,
          type: "received",
          createdAt: now,
          note: state.note || "",
        });
      });

      // ✅ In-app notification for recipient
   await setDoc(doc(db, "users", userId, "notifications", txnId), {
  id: txnId,
  message: `You received ₹${amount} from ${user.email}`,
  from: user.email,
  amount,
  seen: false,
  timestamp: now,
  type: "receive",
});


      // ✅ Redirect to payment result page
      navigate("/payment-result", {
        state: {
          status: "success",
          amount: state.amount,
          recipientName: recipient?.name || "",
          note: state.note || "",
          recipientId: recipient?.id,
          txnId,
        },
      });
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Payment failed");

      navigate("/payment-result", {
        state: {
          status: "failed",
          reason: err.message || "Payment failed",
          amount: state.amount,
          recipientName: recipient?.name || "",
          recipientId: recipient?.id,
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  const logFailedTransaction = async (reason) => {
    const now = new Date();
    const senderRef = doc(db, "users", user.uid);
    const txnRef = doc(collection(senderRef, "transactions"));

    await setDoc(
      txnRef,
      {
        id: txnRef.id,
        type: "send",
        to: recipient?.email || "",
        amount: -state.amount,
        note: `${state.note || "Payment attempt"} • Failed: ${reason}`,
        timestamp: now,
        status: "failed",
      },
      { merge: true }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0d0d0d] px-4">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-[#1a1a1a] border rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold mb-2">Enter your ZUP PIN</h2>
        <p className="text-sm text-gray-500 mb-6">
          Sending ₹{state.amount} to {recipient?.name}
        </p>

        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="text-center text-xl tracking-widest w-full px-4 py-3 mb-4 rounded-lg border dark:bg-[#2a2a2a] dark:text-white"
          placeholder="••••"
        />

        <button
          onClick={handleConfirm}
          disabled={processing}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <FiLoader className="animate-spin" /> Processing...
            </span>
          ) : (
            "Confirm & Pay"
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentProcessing;