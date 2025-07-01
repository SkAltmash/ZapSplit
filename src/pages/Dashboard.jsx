import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSend, FiDownload, FiCreditCard, FiRefreshCw } from "react-icons/fi";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";
import RecentTransactions from "../components/RecentTransactions";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [isAddMoneyOpen, setAddMoneyOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const navigate = useNavigate();

  const fetchBalance = async (uid) => {
    try {
      setLoadingBalance(true);
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setBalance(snap.data().wallet || 0);
      } else {
        await updateDoc(ref, { wallet: 0 });
        setBalance(0);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      toast.error("Failed to fetch balance");
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchBalance(u.uid);
      }
    });

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => unsub();
  }, []);

  const openRazorpay = (order, amount) => {
    const options = {
      key: "rzp_test_wiGiGzDja1aqFw",
      amount: order.amount,
      currency: "INR",
      name: "ZapSplit",
      description: "Add Money to Wallet",
      order_id: order.id,
      handler: async (response) => {
        try {
          const ref = doc(db, "users", user.uid);
          const newBalance = balance + amount;
          await updateDoc(ref, { wallet: newBalance });
          setBalance(newBalance);

          const txnRef = collection(db, "users", user.uid, "transactions");
          await addDoc(txnRef, {
            type: "add",
            amount,
            upi: "razorpay",
            note: "Wallet top-up",
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            timestamp: serverTimestamp(),
          });

          toast.success("Payment successful!");
          setAddMoneyOpen(false);
          window.location.href = `/success?amount=${amount}&paymentId=${response.razorpay_payment_id}`;
        } catch (err) {
          console.error("Error updating wallet:", err);
          toast.error("Wallet update failed.");
        }
      },
      prefill: {
        name: user?.displayName || "Demo User",
        email: user?.email || "demo@example.com",
        contact: user?.mmobile,
      },
      theme: {
        color: "#6b46c1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      return toast.error("Please enter a valid amount");
    }

    try {
      const res = await fetch("/.netlify/functions/createRazorpayOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");

      openRazorpay(data, amount);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create Razorpay order");
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  return (
   <>
    <div className="min-h-screen mt-10 px-4 py-8 md:px-10 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold mb-6"
      >
        Dashboard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-purple-600 dark:bg-purple-500 text-white p-6 rounded-2xl shadow-md flex justify-between items-center mb-10"
      >
        <div>
          <p className="text-sm">Wallet Balance</p>
          {loadingBalance ? (
            <div className="mt-2 w-24 h-7 bg-white/30 animate-pulse rounded" />
          ) : (
            <h2 className="text-3xl font-bold mt-1">₹{balance}</h2>
          )}
        </div>
        <button
          onClick={() => fetchBalance(user.uid)}
          className="text-white hover:text-white/70 transition"
          title="Refresh"
        >
          <FiRefreshCw className="text-2xl" />
        </button>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
         <button
      onClick={() => navigate("/send")}
      className="bg-white dark:bg-[#1a1a1a] border p-4 rounded-xl flex flex-col items-center shadow hover:shadow-md"
    >
      <FiSend className="text-2xl text-purple-600 dark:text-purple-400 mb-1" />
      <span className="text-sm">Send</span>
    </button>
        <button className="bg-white dark:bg-[#1a1a1a] border p-4 rounded-xl flex flex-col items-center shadow hover:shadow-md">
          <FiDownload className="text-2xl text-purple-600 dark:text-purple-400 mb-1" />
          <span className="text-sm">Receive</span>
        </button>
        <button
          onClick={() => setAddMoneyOpen(true)}
          className="bg-white dark:bg-[#1a1a1a] border p-4 rounded-xl flex flex-col items-center shadow hover:shadow-md col-span-2 sm:col-span-1"
        >
          <FiCreditCard className="text-2xl text-purple-600 dark:text-purple-400 mb-1" />
          <span className="text-sm">Add Money</span>
        </button>
      </div>

      {/* Transactions intentionally hidden */}

      <Dialog
        open={isAddMoneyOpen}
        onClose={() => setAddMoneyOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-xl bg-white dark:bg-[#1a1a1a] p-6 shadow-xl border">
            <Dialog.Title className="text-lg font-bold mb-2">
              Add Money
            </Dialog.Title>
            <input
              type="number"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-md border dark:bg-[#2a2a2a] dark:text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddMoneyOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                className="px-4 py-2 bg-purple-600 text-white rounded-md"
              >
                Add
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
          <RecentTransactions />

    </div>
   </>
  );
};

export default Dashboard;
