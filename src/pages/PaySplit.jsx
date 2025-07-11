import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  runTransaction,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const PaySplit = () => {
  const { splitId } = useParams();
  const navigate = useNavigate();

  const [split, setSplit] = useState(null);
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [storedPin, setStoredPin] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchSplit = async () => {
      if (!user || !splitId) return navigate("/");

      const [userSnap, splitSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "splits", splitId)),
      ]);

      if (!userSnap.exists() || !splitSnap.exists()) {
        toast.error("Split or user not found");
        return navigate("/");
      }

      setStoredPin(userSnap.data().zupPin);
      setSplit({ id: splitSnap.id, ...splitSnap.data() });
    };

    fetchSplit();
  }, [user, splitId, navigate]);

  const handleConfirm = async () => {
    if (!pin || pin.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }
    if (pin !== storedPin) {
      toast.error("Incorrect PIN");
      return;
    }

    setProcessing(true);

    try {
      const now = new Date();

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const initiatorRef = doc(db, "users", split.initiator.uid);
        const splitRef = doc(db, "splits", splitId);

        const [userSnap, initiatorSnap, splitSnap] = await Promise.all([
          transaction.get(userRef),
          transaction.get(initiatorRef),
          transaction.get(splitRef),
        ]);

        const userData = userSnap.data();
        const initiatorData = initiatorSnap.data();
        const splitData = splitSnap.data();

        if (userData.wallet < splitData.perPerson) {
          throw new Error("Insufficient balance");
        }

        const updatedParticipants = splitData.participants.map((p) => {
          if (p.uid === user.uid) return { ...p, paid: true };
          return p;
        });

        // update balances
        transaction.update(userRef, {
          wallet: userData.wallet - splitData.perPerson,
        });
        transaction.update(initiatorRef, {
          wallet: (initiatorData.wallet || 0) + splitData.perPerson,
        });
        transaction.update(splitRef, {
          participants: updatedParticipants,
        });

        const payerTxnRef = doc(
          db,
          "users",
          user.uid,
          "transactions",
          `split_${splitId}_${user.uid}`
        );
        const receiverTxnRef = doc(
          db,
          "users",
          split.initiator.uid,
          "transactions",
          `split_${splitId}_${user.uid}`
        );

        transaction.set(payerTxnRef, {
          id: payerTxnRef.id,
          type: "split-payment",
          to: split.initiator.email,
          amount: -splitData.perPerson,
          note: split.note || "Split Payment",
          timestamp: now,
          status: "success",
        });

        transaction.set(receiverTxnRef, {
          id: receiverTxnRef.id,
          type: "split-receive",
          from: user.email,
          amount: splitData.perPerson,
          note: split.note || "Split Payment",
          timestamp: now,
          status: "success",
        });
      });

      const notifId = `notif_${splitId}_${user.uid}`;
      await setDoc(
        doc(db, "users", split.initiator.uid, "notifications", notifId),
        {
          amount: split.perPerson,
          from: user.email,
          id: notifId,
          txnId: splitId,
          message: `₹${split.perPerson} paid by ${user.email} towards "${split.note}"`,
          seen: false,
          createdAt: serverTimestamp(),
          type: "split-payment",
        }
      );

      navigate("/payment-result", {
        state: {
          status: "success",
          amount: split.perPerson,
          recipientName: split.initiator.name,
          note: split.note || "",
          recipientId: split.initiator.uid,
          txnId: splitId,
        },
      });
    } catch (err) {
      toast.error(err.message || "Payment failed");
      navigate("/payment-result", {
        state: {
          status: "failed",
          reason: err.message || "Payment failed",
          amount: split?.perPerson || 0,
          recipientName: split?.initiator?.name || "",
          recipientId: split?.initiator?.uid,
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!split) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading Split Info…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0d0d0d] px-4">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-[#1a1a1a] border rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold mb-2 dark:text-white">Enter your ZUP PIN</h2>
        <p className="text-sm text-gray-500 mb-6">
          Paying ₹{split.perPerson} towards <br /> "<span className="font-medium">{split.note}</span>"
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
          className={`w-full text-white font-semibold py-3 rounded-md ${
            processing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <FiLoader className="animate-spin" /> Processing...
            </span>
          ) : (
            `Pay ₹${split.perPerson}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaySplit;
