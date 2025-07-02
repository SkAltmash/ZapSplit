import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

const PayUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) {
          setRecipient({ id: snap.id, ...snap.data() });
        } else {
          toast.error("User not found");
          navigate("/send");
        }
      }
    });

    return () => unsub();
  }, [userId]);

  const handlePayment = () => {
    const amountNum = parseFloat(amount);
    if (!recipient || isNaN(amountNum) || amountNum <= 0) {
      return toast.error("Enter a valid amount");
    }

    navigate(`/pay/${recipient.id}/processing`, {
      state: {
        amount: amountNum,
        note: note,
      },
    });
  };

  if (!recipient) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-lg border">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/send")}
            className="text-gray-600 dark:text-gray-300"
          >
            <FiArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center overflow-hidden text-lg font-medium uppercase">
              {recipient.photoURL ? (
                <img
                  src={recipient.photoURL}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                recipient.name?.[0] || "U"
              )}
            </div>
            <div>
              <p className="font-semibold">{recipient.name}</p>
              <p className="text-sm text-gray-500">{recipient.email}</p>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border dark:bg-[#2a2a2a] dark:text-white text-xl text-center"
          />

          <input
            type="text"
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dark:bg-[#2a2a2a] dark:text-white text-sm"
          />
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !parseFloat(amount)}
          className={`mt-6 w-full bg-purple-600 text-white font-semibold py-3 rounded-lg transition ${
            !parseFloat(amount) || loading
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-purple-700"
          }`}
        >
          {loading ? "Redirecting..." : `Pay ₹${amount || 0}`}
        </button>
      </div>
    </div>
  );
};

export default PayUser;
