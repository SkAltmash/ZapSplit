import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ZupWealth = () => {
  const [loading, setLoading] = useState(true);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvestments = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const ref = doc(db, "users", user.uid, "zupWealth", "summary");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setGold(data.gold || 0);
          setSilver(data.silver || 0);
        }
      } catch (err) {
        console.error("Failed to fetch investments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl p-6 shadow-lg mt-6 animate-pulse h-40" />
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl p-6 shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-2">ZupWealth</h2>

      {gold === 0 && silver === 0 ? (
        <>
          <p className="text-sm mb-4">
            You haven’t started investing yet. Begin today and secure your future.
          </p>
          <button
            onClick={() => navigate("/invest")}
            className="bg-white text-yellow-700 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100"
          >
            Start Investing
          </button>
          <h4 className="mt-4 font-semibold">Why invest in Gold & Silver?</h4>
          <ul className="mt-2 text-sm list-disc list-inside">
            <li>Protects against inflation</li>
            <li>Highly liquid asset — easy to sell</li>
            <li>Stable and reliable long-term growth</li>
            <li>Diversifies your portfolio</li>
          </ul>
        </>
      ) : (
        <>
          <p className="text-sm mb-4">
            Here’s what you’ve invested so far:
          </p>
          <div className="space-y-1 text-lg">
            <p>
              <span className="font-semibold">Gold:</span> {gold.toFixed(2)} g
            </p>
            <p>
              <span className="font-semibold">Silver:</span> {silver.toFixed(2)} g
            </p>
          </div>
          <button
            onClick={() => navigate("/invest")}
            className="mt-4 bg-white text-yellow-700 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100"
          >
            View Investments
          </button>
        </>
      )}
    </div>
  );
};

export default ZupWealth;
