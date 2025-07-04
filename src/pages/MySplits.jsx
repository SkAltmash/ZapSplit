import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const MySplits = () => {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        navigate("/login");
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "splits"), (snap) => {
      const allSplits = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const mySplits = allSplits.filter((split) => {
        const isInitiator = split.initiator?.uid === user.uid;
        const isParticipant = split.participants?.some(
          (p) => p.uid === user.uid
        );
        return isInitiator || isParticipant;
      });

      setSplits(mySplits);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const getMyPaidStatus = (split) => {
    const me =
      split.participants.find((p) => p.uid === user.uid) || {};
    return me.paid || split.initiator.uid === user.uid;
  };

  const filteredSplits = splits
    .map((split) => ({
      ...split,
      mePaid: getMyPaidStatus(split),
    }))
    .filter((split) => {
      if (filter === "paid") return split.mePaid;
      if (filter === "pending") return !split.mePaid;
      return true;
    })
    .sort((a, b) => a.mePaid - b.mePaid); // pending first

  return (
    <div className="max-w-full mx-auto p-4 mt-12 dark:bg-black min-h-screen">
      <div className="space-y-4 max-w-[500px] mt-5 bg-white dark:bg-[#0d0d0d] p-4 rounded-2xl shadow-lg m-auto">
       <div className="mb-4 flex gap-5">
         <h2 className="text-3xl font-bold mb-4 text-center dark:text-white">
           Splits
        </h2>

        <div className="flex justify-center mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md border text-sm dark:bg-[#1a1a1a] dark:text-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
       </div>

        {loading &&
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse bg-gray-100 dark:bg-[#1b1b1b] rounded-xl p-4"
            >
              <div className="h-4 bg-gray-300 dark:bg-gray-700 w-1/2 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 w-1/4 rounded mb-2"></div>
              <div className="flex gap-2 mt-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}

        {!loading && filteredSplits.length === 0 && (
          <p className="text-gray-500 dark:text-gray-300 text-center">
            No splits found.
          </p>
        )}

        {!loading &&
          filteredSplits.map((split) => {
            const me =
              split.participants.find((p) => p.uid === user.uid) || {};
            const paid = split.mePaid;

            return (
              <div
                key={split.id}
                className="border rounded-xl p-4 flex flex-col gap-3 bg-white dark:bg-[#1b1b1b] shadow hover:shadow-lg transition duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg dark:text-white">
                      {split.note || "No note"}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      Initiator:
                      <img
                        src={
                          split.initiator.photoURL ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            split.initiator.name || split.initiator.email
                          )}`
                        }
                        alt={split.initiator.name}
                        className="h-6 w-6 rounded-full border"
                      />
                      <span className="dark:text-gray-300">
                        {split.initiator.name}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      paid
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {paid ? "Paid" : "Pending"}
                  </div>
                </div>

                <div className="text-sm dark:text-white">
                  <span className="font-medium">Amount: </span>
                  <span className="font-bold">₹{split.amount}</span>
                  <span className="ml-2 text-gray-500">
                    (You owe ₹{split.perPerson})
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  <span className="font-medium dark:text-gray-300">
                    Participants:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {split.participants.map((p) => (
                      <div
                        key={p.uid}
                        className="flex items-center gap-1 bg-gray-100 dark:bg-[#2a2a2a] px-2 py-1 rounded-full"
                        title={`${p.name} (${p.paid ? "Paid" : "Pending"})`}
                      >
                        <img
                          src={
                            p.photoURL ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              p.name || p.email
                            )}`
                          }
                          alt={p.email}
                          className="h-5 w-5 rounded-full border"
                        />
                        <span
                          className={`text-xs ${
                            p.paid ? "text-green-600" : "text-yellow-600"
                          }`}
                        >
                          {p.uid === user.uid
                            ? `You (${p.paid ? "Paid" : "Pending"})`
                            : `${p.name.split(" ")[0]} (${
                                p.paid ? "Paid" : "Pending"
                              })`}
                        </span>

                        {p.uid === user.uid && !p.paid && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pay-split/${split.id}`);
                            }}
                            className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MySplits;
