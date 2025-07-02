import { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "users", currentUser.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
      setHasUnseen(data.some((n) => !n.seen));
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAllSeen = async () => {
    if (!currentUser?.uid) return;
    const unseen = notifications.filter((n) => !n.seen);

    const batchPromises = unseen.map((n) =>
      updateDoc(
        doc(db, "users", currentUser.uid, "notifications", n.id),
        { seen: true }
      )
    );

    try {
      await Promise.all(batchPromises);
    } catch (err) {
      console.error("Failed to mark notifications as seen:", err);
    }
  };

  const toggleDropdown = () => {
    const nowOpen = !isOpen;
    setIsOpen(nowOpen);
    if (nowOpen) markAllSeen();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <FiBell className="text-xl" />
        {hasUnseen && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1a1a1a] border dark:border-white/10 rounded-lg shadow-lg z-50"
          >
            <div className="p-3 text-sm font-semibold border-b dark:border-white/10">
              Notifications
            </div>
            <div className="max-h-64 overflow-y-auto divide-y dark:divide-white/10">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No notifications
                </div>
              ) : (
                notifications.map((note) => (
                  <div
                    key={note.id}
                    className={`px-4 py-2 text-sm ${
                      !note.seen
                        ? "bg-purple-50 dark:bg-purple-950"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {note.title}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
