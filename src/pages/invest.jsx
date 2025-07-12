import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const ZupWealthPrices = () => {
  const [userReady, setUserReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [goldPrices, setGoldPrices] = useState([]);
  const [silverPrices, setSilverPrices] = useState([]);
  const [showGold, setShowGold] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserReady(true);
      }
    });

    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!userReady) return;

    const fetchPrices = async () => {
      setLoading(true);

      // TODO: Replace with real API if needed
      const mockGold = [
        { date: "2025-07-01", price: 5800 },
        { date: "2025-07-02", price: 5850 },
        { date: "2025-07-03", price: 5820 },
        { date: "2025-07-04", price: 5885 },
        { date: "2025-07-05", price: 5900 },
      ];

      const mockSilver = [
        { date: "2025-07-01", price: 72 },
        { date: "2025-07-02", price: 74 },
        { date: "2025-07-03", price: 73 },
        { date: "2025-07-04", price: 75 },
        { date: "2025-07-05", price: 76 },
      ];

      setGoldPrices(mockGold);
      setSilverPrices(mockSilver);
      setLoading(false);
    };

    fetchPrices();
  }, [userReady]);

  if (!userReady || loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg dark:text-white">
        Loading your ZupWealth dashboard…
      </div>
    );
  }

  const data = showGold ? goldPrices : silverPrices;
  const color = showGold ? "#d97706" : "#4b5563";
  const title = showGold ? "Gold (₹/gm)" : "Silver (₹/gm)";

  return (
    <div className="p-6 max-w-2xl  mt-12 mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Current Prices — {title}
      </h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowGold(true)}
          className={`px-4 py-2 rounded-l-md ${
            showGold
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-white"
          }`}
        >
          Gold
        </button>
        <button
          onClick={() => setShowGold(false)}
          className={`px-4 py-2 rounded-r-md ${
            !showGold
              ? "bg-gray-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-white"
          }`}
        >
          Silver
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 shadow">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ZupWealthPrices;
