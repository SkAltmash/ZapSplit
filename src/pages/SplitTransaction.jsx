import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const SplitTransaction = () => {
  const { txnId } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [splitting, setSplitting] = useState(false);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        toast.error("Please login first");
        navigate("/login");
      } else {
        setUser(u);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user || !txnId) return;

    const fetchTransactionAndUsers = async () => {
      try {
        const txnRef = doc(db, "users", user.uid, "transactions", txnId);
        const txnSnap = await getDoc(txnRef);

        if (!txnSnap.exists()) {
          toast.error("Transaction not found");
          navigate("/");
          return;
        }

        setTransaction({ id: txnSnap.id, ...txnSnap.data() });

        const snap = await getDocs(collection(db, "users"));

        const userList = snap.docs
          .filter((d) => d.id !== user.uid)
          .map((doc) => ({
            id: doc.id,
            email: doc.data().email,
            name: doc.data().name || doc.data().email,
            photoURL:
              doc.data().photoURL ||
              `https://ui-avatars.com/api/?name=${doc.data().name || doc.data().email}`,
          }));

        setUsers(userList);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionAndUsers();
  }, [user, txnId, navigate]);

  const handleSelect = (u) => {
    if (selected.find((s) => s.uid === u.id)) {
      setSelected(selected.filter((s) => s.uid !== u.id));
    } else {
      if (selected.length >= 4) {
        toast.error("You can split with up to 4 others only.");
        return;
      }
      setSelected([
        ...selected,
        { uid: u.id, email: u.email, name: u.name, paid: false, photoURL: u.photoURL },
      ]);
    }
  };

  const handleSplit = async () => {
    const totalParticipants = selected.length + 1;
    const perPerson = Math.abs(transaction.amount) / totalParticipants;

    if (!transaction || selected.length === 0) {
      toast.error("Please select participants");
      return;
    }

    if (perPerson < 1) {
      toast.error("Amount is too small to split between these participants.");
      return;
    }

    setSplitting(true);

    try {
      await addDoc(collection(db, "splits"), {
        txnId: transaction.id,
        initiator: {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email,
          photoURL: user.photoURL || "",
        },
        amount: Math.abs(transaction.amount),
        perPerson,
        participants: [
          {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email,
            paid: true,
            photoURL: user.photoURL || "",
          },
          ...selected.map((u) => ({ ...u, paid: false })),
        ],
        createdAt: serverTimestamp(),
        note: transaction.note || "",
        status: "pending",
      });

      await updateDoc(
        doc(db, "users", user.uid, "transactions", txnId),
        { split: true }
      );

      toast.success("Split recorded!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to record split");
    } finally {
      setSplitting(false);
    }
  };

  if (!transaction) {
    return <p className="text-center mt-10">Loading…</p>;
  }

  const totalParticipants = selected.length + 1;
  const perPerson = (Math.abs(transaction.amount) / totalParticipants).toFixed(2);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const disableSplit =
    selected.length === 0 || splitting || perPerson < 1;

  return (
   <div className="w-screen bg-white dark:bg-[#1b1b1b]">
  <div className="max-w-md mx-auto p-4 mt-12 dark:bg-black min-h-[calc(100vh-3rem)]  bg-white rounded-2xl shadow-lg flex flex-col">
    
    <h2 className="text-2xl font-bold mb-2 text-center dark:text-white">
      Split ₹{Math.abs(transaction.amount)} for "{transaction.note}"
    </h2>

    <p className="text-sm mb-4 text-center dark:text-white">
      Select up to 4 participants to split with:
    </p>

    <input
      type="text"
      placeholder="Search participants..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full px-3 py-2 mb-3 border rounded focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700"
    />

    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
      {loading
        ? Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-3 py-2 rounded border shadow-sm animate-pulse bg-gray-100 dark:bg-gray-800"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))
        : filteredUsers.map((u) => (
            <label
              key={u.id}
              className={`flex items-center gap-3 px-3 py-2 rounded border shadow-sm cursor-pointer transition
              hover:bg-gray-50 dark:hover:bg-gray-800
              ${
                selected.some((s) => s.uid === u.id)
                  ? "bg-green-50 border-green-400 dark:bg-green-900"
                  : "dark:bg-gray-900 dark:border-gray-700"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.some((s) => s.uid === u.id)}
                onChange={() => handleSelect(u)}
              />
              <img
                src={u.photoURL}
                alt={u.name}
                className="w-8 h-8 rounded-full border"
              />
              <div className="flex flex-col">
                <span className="font-medium dark:text-white">{u.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {u.email}
                </span>
              </div>
            </label>
          ))}
    </div>

    <div className="mt-4">
      <button
        onClick={handleSplit}
        disabled={disableSplit}
        className={`px-4 py-2 rounded w-full text-white text-lg transition
          ${
            disableSplit
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {splitting
          ? "Splitting…"
          : perPerson < 1
          ? "Amount too small to split"
          : `Split ₹${perPerson} each (${totalParticipants} people)`}
      </button>
    </div>

  </div>
</div>

  );
};

export default SplitTransaction;
