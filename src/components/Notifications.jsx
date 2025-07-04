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
        className="p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
      >
        <FiBell className="text-2xl" />
        {hasUnseen && (
          <>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </>
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
              className="fixed top-16 right-4 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl z-50 w-80"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Notifications
                </h3>

                <div className="my-3 max-h-48 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You have no notifications.
                    </p>
                  ) : (
                    notifications.map((note) => (
                      <div
                        key={note.id}
                        className={`px-3 py-2 rounded-lg text-sm leading-snug transition
                          ${
                            !note.seen
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 font-medium"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {note.message}
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={goToNotifications}
                  className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition"
                >
                  View All
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
