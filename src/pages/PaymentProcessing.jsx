import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const PaymentProcessing = () => {
  const { userId } = useParams();
  const { state } = useLocation(); // contains: amount, note
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
    if (!pin || pin.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }
    if (pin !== storedPin) {
      await logFailedTransaction("Incorrect PIN");
      return navigate("/payment-result", {
        state: {
          status: "failed",
          reason: "Incorrect PIN",
          amount: state.amount,
          recipientName: recipient?.name || "",
          recipientId: recipient?.id,
        },
      });
    }

    setProcessing(true);

    try {
      const amount = Number(state.amount);
      const note = state.note || "Sent via ZapSplit";

      // generate transaction ID
      const txnId = doc(collection(db, "dummy")).id;

      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, "users", user.uid);
        const recipientRef = doc(db, "users", userId);

        const [senderSnap, recipientSnap] = await Promise.all([
          transaction.get(senderRef),
          transaction.get(recipientRef),
        ]);

        const sender = senderSnap.data();
        const recipient = recipientSnap.data();

        if (sender.wallet < amount) {
          throw new Error("Insufficient Balance");
        }

        transaction.update(senderRef, { wallet: sender.wallet - amount });
        transaction.update(recipientRef, { wallet: (recipient.wallet || 0) + amount });

        const senderTxnRef = doc(db, "users", user.uid, "transactions", txnId);
        const recipientTxnRef = doc(db, "users", userId, "transactions", txnId);

        const timestamp = serverTimestamp();

        transaction.set(senderTxnRef, {
          id: txnId,
          type: "send",
          to: recipient.email,
          amount: -amount,
          note,
          timestamp,
          status: "success",
        });

        transaction.set(recipientTxnRef, {
          id: txnId,
          type: "receive",
          from: sender.email,
          amount,
          note,
          timestamp,
          status: "success",
        });
      });

      // 🔔 Notification
      const notifId = `notif_${txnId}`;
      await setDoc(doc(db, "users", userId, "notifications", notifId), {
        amount,
        from: user.email,
        id: notifId,
        txnId,
        message: `₹${amount} received from ${auth.currentUser?.displayName || "a user"}`,
        seen: false,
        createdAt: serverTimestamp(),
        type: "receive",
      });

      // 📝 Add/update conversation
      const conversationId =
        user.uid < userId ? `${user.uid}_${userId}` : `${userId}_${user.uid}`;

      const message = {
        text: `₹${amount} sent`,
        from: user.uid,
        to: userId,
        amount,
        note,
        timestamp: serverTimestamp(),
        txnId,
        type: "payment",
        status: "success",
      };

      // update parent doc
      await setDoc(
        doc(db, "conversations", conversationId),
        {
          users: [user.uid, userId],
          lastMessage: message,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // add message to messages subcollection
      await addDoc(
        collection(db, "conversations", conversationId, "messages"),
        message
      );

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
      console.error(err);
      await logFailedTransaction(err.message || "Transaction Failed");
      navigate("/payment-result", {
        state: {
          status: "failed",
          reason: err.message || "Transaction Failed",
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
    const txnRef = doc(collection(db, "users", user.uid, "transactions"));
    const conversationId =
      user.uid < userId ? `${user.uid}_${userId}` : `${userId}_${user.uid}`;

    const failedTxn = {
      id: txnRef.id,
      type: "send",
      to: recipient?.email || "",
      amount: -state.amount,
      note: `${state.note || "Payment attempt"} • Failed: ${reason}`,
      timestamp: serverTimestamp(),
      status: "failed",
    };

    // save in transactions
    await setDoc(txnRef, failedTxn, { merge: true });

    const failedMsg = {
      text: `₹${state.amount} failed`,
      from: user.uid,
      to: userId,
      amount: state.amount,
      note: reason,
      timestamp: serverTimestamp(),
      txnId: txnRef.id,
      type: "payment",
      status: "failed",
    };

    // save/update conversation doc
    await setDoc(
      doc(db, "conversations", conversationId),
      {
        users: [user.uid, userId],
        lastMessage: failedMsg,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // save in messages
    await addDoc(
      collection(db, "conversations", conversationId, "messages"),
      failedMsg
    );
  };

  if (!recipient) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0d0d0d] px-4">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-[#1a1a1a] border rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold mb-2 dark:text-white">Enter your ZUP PIN</h2>
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
