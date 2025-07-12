import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { Bar, Pie, Line } from "react-chartjs-2";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import Papa from "papaparse";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const AnalysisSection = () => {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ sent: 0, received: 0, count: 0 });
  const [monthlyData, setMonthlyData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        toast.error("Login to view analysis");
        return;
      }

      setLoading(true);

      try {
        const q = collection(db, "conversations");
        const convoSnaps = await getDocs(q);

        let sent = 0,
          received = 0,
          count = 0;

        const monthMap = {};
        const weekMap = {};
        const userMap = {};
        const csvRows = [];

        for (const convo of convoSnaps.docs) {
          const msgsSnap = await getDocs(collection(convo.ref, "messages"));
          msgsSnap.forEach((msgDoc) => {
            const msg = msgDoc.data();
            if (msg.type === "payment" && msg.amount) {
              count++;
              const ts = msg.timestamp?.toDate?.() || new Date();
              const month = format(ts, "MMM");
              const week = format(ts, "w");
              const amount = Math.abs(msg.amount);

              csvRows.push({
                to: msg.to || "",
                from: msg.from || "",
                amount,
                status: msg.status,
                date: format(ts, "yyyy-MM-dd HH:mm"),
                note: msg.note || "",
              });

              if (msg.from === user.uid) {
                sent += amount;
                monthMap[month] = monthMap[month] || { sent: 0, received: 0 };
                monthMap[month].sent += amount;

                weekMap[week] = weekMap[week] || { sent: 0, received: 0 };
                weekMap[week].sent += amount;

                userMap[msg.to] = (userMap[msg.to] || 0) + amount;
              } else {
                received += amount;
                monthMap[month] = monthMap[month] || { sent: 0, received: 0 };
                monthMap[month].received += amount;

                weekMap[week] = weekMap[week] || { sent: 0, received: 0 };
                weekMap[week].received += amount;

                userMap[msg.from] = (userMap[msg.from] || 0) + amount;
              }
            }
          });
        }

        setTotals({ sent, received, count });
        setCsvData(csvRows);

        const months = Object.keys(monthMap);
        setMonthlyData({
          labels: months,
          datasets: [
            {
              label: "Sent",
              data: months.map((m) => monthMap[m].sent),
              backgroundColor: "#a855f7",
            },
            {
              label: "Received",
              data: months.map((m) => monthMap[m].received),
              backgroundColor: "#22c55e",
            },
          ],
        });

        setPieData({
          labels: ["Sent", "Received"],
          datasets: [
            {
              data: [sent, received],
              backgroundColor: ["#a855f7", "#22c55e"],
            },
          ],
        });

        const weeks = Object.keys(weekMap);
        setLineData({
          labels: weeks,
          datasets: [
            {
              label: "Sent",
              data: weeks.map((w) => weekMap[w].sent),
              borderColor: "#a855f7",
              fill: false,
            },
            {
              label: "Received",
              data: weeks.map((w) => weekMap[w].received),
              borderColor: "#22c55e",
              fill: false,
            },
          ],
        });

        const sortedUsersRaw = Object.entries(userMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const topUsersWithData = await Promise.all(
          sortedUsersRaw.map(async ([userId, amount]) => {
            try {
              const userSnap = await getDoc(doc(db, "users", userId));
              if (userSnap.exists()) {
                const data = userSnap.data();
                return {
                  userId,
                  amount,
                  name: data.name || userId,
                  photoURL: data.photoURL || "",
                };
              } else {
                return {
                  userId,
                  amount,
                  name: userId,
                  photoURL: "",
                };
              }
            } catch {
              return {
                userId,
                amount,
                name: userId,
                photoURL: "",
              };
            }
          })
        );

        setTopUsers(topUsersWithData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch analysis");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const exportCSV = () => {
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `transactions-${Date.now()}.csv`);
  };

  if (loading) {
    return (
      <div className="mt-8 w-full space-y-4 animate-pulse px-2 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full space-y-6 px-2 md:px-0">
      <h3 className="text-lg font-bold dark:text-white">Analysis</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 p-3 rounded shadow text-center">
          <p className="text-xs">Total Sent</p>
          <p className="text-lg font-bold">₹{totals.sent}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-3 rounded shadow text-center">
          <p className="text-xs">Total Received</p>
          <p className="text-lg font-bold">₹{totals.received}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-3 rounded shadow text-center">
          <p className="text-xs">Transactions</p>
          <p className="text-lg font-bold">{totals.count}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm shadow"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-4 justify-center dark:text-white">
        <div className="bg-white dark:bg-[#1a1a1a] rounded shadow p-4 w-full sm:w-[48%] md:w-[30%]">
          <h4 className="text-sm font-semibold mb-3">Monthly Sent vs Received</h4>
          <Bar data={monthlyData} />
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded shadow p-4 w-full sm:w-[48%] md:w-[30%]">
          <h4 className="text-sm font-semibold mb-3">Overall Sent vs Received</h4>
          <Pie data={pieData} />
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded shadow p-4 w-full sm:w-[48%] md:w-[30%]">
          <h4 className="text-sm font-semibold mb-3">Weekly Trend</h4>
          <Line data={lineData} />
        </div>
      </div>

      {topUsers.length > 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded shadow p-4">
          <h4 className="text-sm font-semibold mb-3 dark:text-white">Top 5 Users by Amount</h4>
          <ul className="text-sm space-y-2">
            {topUsers.map((u, i) => (
              <li key={u.userId} className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{i + 1}.</span>
                <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs bg-purple-400 text-white">
                      {u.name?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 dark:text-white">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-200">₹{u.amount}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisSection;
