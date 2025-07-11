import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiDownload,
  FiCreditCard,
  FiRefreshCw,
  FiBell,
} from "react-icons/fi";
import QRCode from "react-qr-code";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import RecentTransactions from "../components/RecentTransactions";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import DashboardUsers from "./DashboardUsers";
import ZupPayLaterCard from "../components/ZupPayLaterCard";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [greeting, setGreeting] = useState("Hello");
  const [qrOpen, setQrOpen] = useState(false);
  const [upi, setUpi] = useState("");
  const navigate = useNavigate();

  const fetchBalance = async (uid) => {
    try {
      setLoadingBalance(true);
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setBalance(data.wallet || 0);
        setUpi(data.upi || "upi_not_set@example.com");
      } else {
        setBalance(0);
        setUpi("upi_not_set@example.com");
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      toast.error("Failed to fetch balance");
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }

    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchBalance(u.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsub();
  }, [navigate]);

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
          className="text-3xl font-bold mb-2"
        >
          {greeting}, <span className="text-purple-600">{user.displayName}</span>!
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center mb-10"
        >
          <div>
            <p className="text-sm">Wallet Balance</p>
            {loadingBalance ? (
              <div className="mt-2 w-24 h-7 bg-white/30 animate-pulse rounded" />
            ) : (
              <motion.h2
                key={balance}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-4xl font-bold mt-1"
              >
                ₹{balance.toLocaleString()}
              </motion.h2>
            )}
          </div>

          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => fetchBalance(user.uid)}
              className="text-white hover:text-white/70 transition"
              title="Refresh Balance"
            >
              <FiRefreshCw className="text-2xl" />
            </button>
            {balance < 100 && !loadingBalance && (
              <span className="flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-2">
                <FiBell className="mr-1" /> Low Balance
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {/* Send */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/send")}
            className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 border border-purple-300 dark:border-purple-600 p-4 rounded-xl flex flex-col items-center shadow hover:shadow-lg transition"
          >
            <FiSend className="text-3xl text-purple-700 dark:text-purple-200 mb-1" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-200">
              Send
            </span>
          </motion.button>

          {/* Receive */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setQrOpen(true)}
            className="backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 p-4 rounded-xl flex flex-col items-center shadow hover:shadow-lg hover:brightness-110 transition"
          >
            <FiDownload className="text-3xl text-purple-600 dark:text-purple-400 mb-1" />
            <span className="text-sm">Receive</span>
          </motion.button>

          {/* Add Money */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/add-money")}
            className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 border border-green-300 dark:border-green-600 p-4 rounded-xl flex flex-col items-center shadow hover:shadow-lg transition col-span-2 sm:col-span-1"
          >
            <FiCreditCard className="text-3xl text-green-700 dark:text-green-200 mb-1" />
            <span className="text-sm font-medium text-green-700 dark:text-green-200">
              Add Money
            </span>
          </motion.button>
        </div>

        <DashboardUsers />
                <ZupPayLaterCard />

        <RecentTransactions />
      </div>

      <Footer />

      {/* QR Modal */}
      <AnimatePresence>
        {qrOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setQrOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow-lg w-72"
            >
              <h3 className="text-lg font-semibold mb-4 text-center dark:text-white">
                Scan to Receive
              </h3>
              <div className="flex justify-center">
                <QRCode
                  value={upi || "upi_not_set@example.com"}
                  size={160}
                  bgColor="transparent"
                />
              </div>
              <p className="text-xs text-center mt-2 text-gray-500  dark:text-gray-300 break-all">
                {upi}
              </p>
              <button
                onClick={() => setQrOpen(false)}
                className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
