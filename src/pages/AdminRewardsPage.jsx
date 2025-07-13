import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { FiGift, FiCheck } from "react-icons/fi";

const AdminRewardsPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [txnType, setTxnType] = useState("payment");
  const [rewardAmount, setRewardAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const createReward = async () => {
    if (!name || !minAmount || !rewardAmount) return;
    setLoading(true);
    await addDoc(collection(db, "rewards"), {
      name,
      description,
      minAmount: Number(minAmount),
      txnType,
      rewardAmount: Number(rewardAmount),
      createdAt: serverTimestamp(),
    });
    setName("");
    setDescription("");
    setMinAmount("");
    setTxnType("payment");
    setRewardAmount("");
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-15 p-4 bg-white rounded shadow space-y-3">
      <h2 className="text-xl font-bold flex items-center gap-1">
        <FiGift /> Create New Reward
      </h2>

      <input placeholder="Name"
        value={name} onChange={e => setName(e.target.value)}
        className="w-full border rounded p-2" />
      <textarea placeholder="Description (optional)"
        value={description} onChange={e => setDescription(e.target.value)}
        className="w-full border rounded p-2" />
      <input placeholder="Minimum Transaction Amount"
        type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)}
        className="w-full border rounded p-2" />
      <input placeholder="Reward Amount"
        type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)}
        className="w-full border rounded p-2" />

      <button
        onClick={createReward}
        disabled={loading}
        className="bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-1"
      >
        {loading ? "Creating…" : <> <FiCheck /> Create Reward </>}
      </button>
    </div>
  );
};

export default AdminRewardsPage;
