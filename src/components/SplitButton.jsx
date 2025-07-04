import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { FiDivide } from "react-icons/fi";

const SplitButton = () => {
  const [hasPending, setHasPending] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "splits"), (snap) => {
      const myPending = snap.docs
        .map((doc) => doc.data())
        .filter((split) => {
          const me = split.participants.find((p) => p.uid === user.uid);
          const isInitiator = split.initiator?.uid === user.uid;
          return me && !me.paid && !isInitiator;
        });
      setHasPending(myPending.length > 0);
    });
    return () => unsub();
  }, [user]);

  return (
    <button
      onClick={() => navigate("/my-splits")}
      className="relative p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <FiDivide className="text-2xl" />
      {hasPending && (
        <>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        </>
      )}
    </button>
  );
};

export default SplitButton;
