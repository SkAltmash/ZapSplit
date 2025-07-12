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

const ExtendDue = () => {
  const { txnId } = useParams();
  const navigate = useNavigate();

  const [txn, setTxn] = useState(null);
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [storedPin, setStoredPin] = useState(null);
  const [selectedDays, setSelectedDays] = useState(15);
  const [extraCharge, setExtraCharge] = useState(0);

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
      const txnData = { id: txnSnap.id, ...txnSnap.data() };
      setTxn(txnData);
      calculateCharge(txnData.amount, selectedDays);
    };

    fetchTxn();
  }, [user, txnId, navigate]);

  const calculateCharge = (baseAmount, days) => {
    const charge = Math.ceil(baseAmount * 0.01 * days); // 1% per day
    setExtraCharge(charge);
  };

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
      const newDueDate = new Date(txn.dueDate.toDate());
      newDueDate.setDate(newDueDate.getDate() + selectedDays);

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

        if (userData.wallet < extraCharge) {
          throw new Error("Insufficient wallet balance to pay extension fee");
        }

        // deduct fee from wallet
        transaction.update(userRef, {
          wallet: userData.wallet - extraCharge,
        });

        // update transaction with new due date & add extension record
        transaction.update(txnRef, {
          dueDate: newDueDate,
          extensions: [
            ...(txnData.extensions || []),
            {
              extendedAt: now,
              addedDays: selectedDays,
              newDueDate,
              feePaid: extraCharge,
            },
          ],
        });

        // add to transaction history
        const historyRef = doc(
          db,
          "users",
          user.uid,
          "transactions",
          `extend_${txnId}_${Date.now()}`
        );
        transaction.set(historyRef, {
          id: historyRef.id,
          type: "paylater-extend",
          amount: -extraCharge,
          note: `Extended due by ${selectedDays} days`,
          timestamp: now,
          status: "success",
        });
      });

      const notifId = `notif_extend_${txnId}_${Date.now()}`;
      await setDoc(
        doc(db, "users", user.uid, "notifications", notifId),
        {
          id: notifId,
          txnId,
          message: `You extended your PayLater due by ${selectedDays} days. Fee of ₹${extraCharge} debited.`,
          seen: false,
          createdAt: serverTimestamp(),
          type: "paylater-extend",
        }
      );

      navigate(`/paylater-txn/${txnId}`);
    } catch (err) {
      toast.error(err.message || "Extension failed");
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
        <h2 className="text-xl font-bold mb-2 dark:text-white">Extend Due Date</h2>
        <p className="text-sm text-gray-500 mb-6">
          Current Amount: ₹{txn.amount} <br />
          Note: "<span className="font-medium">{txn.note}</span>"
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium dark:text-gray-300">Select Extra Days:</p>
          <div className="flex justify-center gap-2">
            {[15, 30, 45].map((days) => (
              <button
                key={days}
                onClick={() => {
                  setSelectedDays(days);
                  calculateCharge(txn.amount, days);
                }}
                className={`px-3 py-1 rounded border ${
                  selectedDays === days
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-[#2a2a2a] dark:text-white"
                }`}
              >
                +{days} days
              </button>
            ))}
          </div>
          <p className="text-sm text-green-600">
            Extension Fee: ₹{extraCharge}
          </p>
        </div>

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
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <FiLoader className="animate-spin" /> Processing...
            </span>
          ) : (
            `Extend Due by ${selectedDays} days`
          )}
        </button>
      </div>
    </div>
  );
};

export default ExtendDue;
