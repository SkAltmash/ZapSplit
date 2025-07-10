import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSend, FiDownload, FiCreditCard, FiRefreshCw } from "react-icons/fi";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import RecentTransactions from "../components/RecentTransactions";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import DashboardUsers from "./DashboardUsers";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const navigate = useNavigate();

  const fetchBalance = async (uid) => {
    try {
      setLoadingBalance(true);
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setBalance(snap.data().wallet || 0);
      } else {
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

    return () => unsub();
  }, []);

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
          <p>Hello <span className="text-purple-600">{user.displayName}</span></p>
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
            onClick={() => navigate("/add-money")}
            className="bg-white dark:bg-[#1a1a1a] border p-4 rounded-xl flex flex-col items-center shadow hover:shadow-md col-span-2 sm:col-span-1"
          >
            <FiCreditCard className="text-2xl text-purple-600 dark:text-purple-400 mb-1" />
            <span className="text-sm">Add Money</span>
          </button>
        </div>
        
        <DashboardUsers />
        <RecentTransactions />
      </div>

      <Footer />
    </>
  );
};

export default Dashboard;
