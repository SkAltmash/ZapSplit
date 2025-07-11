import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  orderBy,
  query,
  getDoc,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { FaBell } from "react-icons/fa";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const markAsSeen = async (notifId) => {
    const notifRef = doc(db, "users", user.uid, "notifications", notifId);
    const notifSnap = await getDoc(notifRef);
    if (!notifSnap.exists()) return;

    await updateDoc(notifRef, { seen: true });

    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, seen: true } : n))
    );
  };

  const Skeleton = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-full h-16 rounded-lg bg-gray-200 dark:bg-[#2a2a2a] animate-pulse"
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen dark:bg-black text-gray-800 dark:text-white px-4 py-10">
      <div className="max-w-xl mx-auto  bg-white mt-12 dark:bg-[#0d0d0d] p-4 rounded-2xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaBell className="text-black dark:text-white " />
          Your Notifications
        </h1>

        {loading ? (
          <Skeleton />
        ) : notifications.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No notifications found.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {notifications.map((n, index) => {
              const isFirst = index === 0;
              const isLast = index === notifications.length - 1;

              return (
                <li
                  key={n.id}
                  onClick={() => markAsSeen(n.id)}
                  className={`cursor-pointer px-4 py-3 shadow border transition duration-200
                    ${n.seen
                      ? "bg-gray-100 dark:bg-[#1a1a1a] border-gray-300 dark:border-white/10"
                      : "bg-yellow-100 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600"}
                    ${isFirst ? "rounded-t-lg" : ""}
                    ${isLast ? "rounded-b-lg" : ""}
                  `}
                >
                  <p
                    className={`text-sm ${
                      n.seen
                        ? "font-normal"
                        : "font-semibold text-yellow-800 dark:text-yellow-100"
                    }`}
                  >
                    {n.message}
                  </p>
                  {n.createdAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(n.createdAt.toDate(), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
