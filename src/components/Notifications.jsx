import { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const goToNotifications = () => {
    handleClose();
    navigate("/notifications");
  };

  const hasUnseen = notifications.some((n) => !n.seen);

  return (
    <div className="relative z-50">
      {/* Bell Icon */}
      <button
        onClick={handleOpen}
        className="p-2 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 relative"
      >
        <FiBell className="text-xl" />
        {hasUnseen && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </>
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
              className="fixed top-20 right-6 bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-lg z-50 w-72"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">Notifications</h3>

              <div className="mb-4 max-h-40 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No notifications yet.</p>
                ) : (
                  notifications.map((note) => (
                    <div
                      key={note.id}
                      className={`px-3 py-2 rounded text-sm transition ${
                        !note.seen
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 font-semibold"
                          : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {note.message}
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={goToNotifications}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Go to Notifications
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
