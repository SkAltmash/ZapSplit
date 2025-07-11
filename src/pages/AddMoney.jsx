import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const AddMoney = () => {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        navigate("/login");
      } else {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setCurrentBalance(snap.data().wallet || 0);
        }
      }
    });

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => unsub();
  }, [navigate]);

  const handleRazorpay = async () => {
    const enteredAmount = parseFloat(amount);
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/createRazorpayOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: enteredAmount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      openRazorpay(data, enteredAmount);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };

  const openRazorpay = (order, enteredAmount) => {
    const options = {
      key: "rzp_test_wiGiGzDja1aqFw", // replace with prod key in production
      amount: order.amount,
      currency: "INR",
      name: "ZapSplit",
      description: "Add Money to Wallet",
      order_id: order.id,
      handler: async () => {
        toast.success("Payment Success via Razorpay!");
        try {
          const txnRef = collection(db, "users", user.uid, "transactions");
          await addDoc(txnRef, {
            type: "add",
            amount: enteredAmount,
            upi: "Razorpay",
            note: "Wallet top-up (Razorpay)",
            paymentId: `Razor${Date.now()}`,
            orderId: `order_${Date.now()}`,
            timestamp: serverTimestamp(),
            status: "success",
          });
          setCurrentBalance((prev) => prev + enteredAmount);
          navigate(`/success?amount=${enteredAmount}`);
        } catch (err) {
          console.error(err);
          toast.error("Failed to record transaction.");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: user?.displayName || "ZapSplit User",
        email: user?.email || "user@example.com",
      },
      theme: { color: "#6b46c1" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleZupPay = () => {
    const enteredAmount = parseFloat(amount);
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    navigate(`/zuppay?amount=${enteredAmount}`);
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 px-4 py-8 md:px-10 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white">
      <div className="max-w-md mx-auto bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Add Money to Wallet</h1>

        <p className="text-sm mb-2">
          Current Balance:{" "}
          <span className="font-semibold">₹{currentBalance.toFixed(2)}</span>
        </p>

        <label className="block text-sm font-medium mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-4 py-2 mb-3 rounded-md border dark:bg-[#2a2a2a] dark:text-white"
        />

        <div className="flex gap-2 mb-4">
          {[100, 500, 1000].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-700/30 text-purple-700 dark:text-purple-200 rounded-md text-sm"
            >
              ₹{val}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRazorpay}
            disabled={loading || !user}
            className="w-full py-2 flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <span>Processing…</span>
            ) : (
              <>
                Pay with{" "}
                <span className="font-semibold">
                  Razorpay <span className="text-xs">(Recommended)</span>
                </span>
              </>
            )}
          </button>

          <button
            onClick={handleZupPay}
            disabled={loading || !user}
            className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            Pay with <span className="font-semibold">ZupPay</span> (Inbuilt)
          </button>
        </div>

        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          100% Secure • Zap Security Protected
        </p>
      </div>
    </div>
  );
};

export default AddMoney;
