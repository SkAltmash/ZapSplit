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

const PayDue = () => {
  const { txnId } = useParams();
  const navigate = useNavigate();

  const [txn, setTxn] = useState(null);
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [storedPin, setStoredPin] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchTxn = async () => {
      if (!user || !txnId) return navigate("/");

      const [userSnap, txnSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "users", user.uid, "paylaterTransactions", txnId)),
      ]);

      if (!userSnap.exists() || !txnSnap.exists()) {
        toast.error("Transaction or user not found");
        return navigate("/");
      }

      setStoredPin(userSnap.data().zupPin);
      setTxn({ id: txnSnap.id, ...txnSnap.data() });
    };

    fetchTxn();
  }, [user, txnId, navigate]);

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
        const txnRef = doc(db, "users", user.uid, "paylaterTransactions", txnId);

        const [userSnap, txnSnap] = await Promise.all([
          transaction.get(userRef),
          transaction.get(txnRef),
        ]);

        const userData = userSnap.data();
        const txnData = txnSnap.data();

        if (txnData.status === "paid") {
          throw new Error("This due is already paid");
        }

        if (userData.wallet < txnData.amount) {
          throw new Error("Insufficient wallet balance");
        }

        if ((userData.usedCredit || 0) < txnData.amount) {
          throw new Error("Invalid usedCredit — cannot pay more than due");
        }

        // update wallet & usedCredit
        transaction.update(userRef, {
          wallet: userData.wallet - txnData.amount,
          usedCredit: (userData.usedCredit || 0) - txnData.amount,
        });

        // mark transaction as paid
        transaction.update(txnRef, {
          status: "paid",
          paidAt: now,
        });

        // add to transactions history
        const historyRef = doc(
          db,
          "users",
          user.uid,
          "transactions",
           txnId
        );
        transaction.set(historyRef, {
          id: historyRef.id,
          type: "paylater-payment",
          amount: -txnData.amount,
          note: txnData.note || "PayLater repayment",
          timestamp: now,
          status: "success",
        });
      });

      const notifId = `notif_paylater_${txnId}`;
      await setDoc(
        doc(db, "users", user.uid, "notifications", notifId),
        {
          id: notifId,
          txnId,
          amount: txn.amount,
          message: `You paid ₹${txn.amount} towards your PayLater due: "${txn.note}"`,
          seen: false,
          createdAt: serverTimestamp(),
          type: "paylater-payment",
        }
      );

      navigate("/payment-result", {
        state: {
          status: "success",
          amount: txn.amount,
          note: txn.note || "",
          txnId,
        },
      });
    } catch (err) {
      toast.error(err.message || "Payment failed");
      navigate("/payment-result", {
        state: {
          status: "failed",
          reason: err.message || "Payment failed",
          amount: txn?.amount || 0,
          txnId,
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!txn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading PayLater Due…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0d0d0d] px-4">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-[#1a1a1a] border rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold mb-2 dark:text-white">Enter your ZUP PIN</h2>
        <p className="text-sm text-gray-500 mb-6">
          Paying ₹{txn.amount} towards <br /> "<span className="font-medium">{txn.note}</span>"
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
            `Pay ₹${txn.amount}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PayDue;
