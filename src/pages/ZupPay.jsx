import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const ZupPay = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const amount = parseFloat(query.get("amount"));

  useEffect(() => {
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      navigate("/add-money");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) throw new Error("User not found");

        const currentBalance = userSnap.data().wallet || 0;
        const newBalance = currentBalance + amount;

        await updateDoc(userRef, { wallet: newBalance });

        const txnRef = collection(db, "users", user.uid, "transactions");
        await addDoc(txnRef, {
          type: "add",
          amount,
          upi: "zuppay",
          note: "Wallet top-up (ZupPay)",
          paymentId: `zuppay_${Date.now()}`,
          orderId: `order_${Date.now()}`,
          timestamp: serverTimestamp(),
        });

        toast.success("Payment Successful 🎉");
        navigate(`/success?amount=${amount}`);
      } catch (err) {
        console.error(err);
        toast.error("Payment failed");
        navigate("/add-money");
      } finally {
        setLoading(false);
      }
    }, 5000); // simulate 5s processing

    return () => clearTimeout(timer);
  }, [amount, navigate]);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white">
      <div className="bg-white dark:bg-[#1a1a1a] shadow-lg rounded-lg p-6 flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-purple-400 border-dashed rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold">Processing Payment…</h2>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we complete your ₹{amount} payment.
        </p>
      </div>
    </div>
  );
};

export default ZupPay;
