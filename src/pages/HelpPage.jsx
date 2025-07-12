import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { FiMail, FiGithub, FiLinkedin } from "react-icons/fi";

const PAGE_SIZE = 5;

const HelpPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    fetchTransactions(true);
  }, [user]);

  const fetchTransactions = async (isFirst = false) => {
    if (!user) return;

    setLoading(true);

    const baseQuery = collection(db, "users", user.uid, "transactions");
    let q = query(baseQuery, orderBy("timestamp", "desc"), limit(PAGE_SIZE));

    if (!isFirst && lastDoc) {
      q = query(
        baseQuery,
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    }

    const snap = await getDocs(q);
    const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setTransactions((prev) => (isFirst ? docs : [...prev, ...docs]));
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.size === PAGE_SIZE);

    setLoading(false);
  };

  const Skeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-full h-16 rounded-lg bg-gray-200 dark:bg-[#2a2a2a] animate-pulse"
        />
      ))}
    </div>
  );

  const FAQs = [
    {
      q: "How long does a transaction take?",
      a: "Most transactions complete instantly, but in rare cases it can take up to a few minutes.",
    },
    {
      q: "What if my transaction failed?",
      a: "You can retry the transaction. If money was deducted, it will be refunded within 24 hours.",
    },
    {
      q: "How do I view my transaction history?",
      a: "Scroll down to the transactions section on this page or on your dashboard.",
    },
    {
      q: "How does Invite & Earn work?",
      a: "Invite your friends using your unique referral link. Once they sign up and make a successful payment, you can claim your reward from the Invite & Earn page.",
    },
    {
      q: "What is PayLater and how do I use it?",
      a: "PayLater gives you a credit limit that you can use now and pay back later. Check your available credit on the PayLater dashboard and view your transactions there.",
    },
    {
      q: "Can I upload my own profile picture?",
      a: "Yes! You can upload a custom profile picture from your device. It will be saved securely in our system and shown on your profile.",
    },
    {
      q: "Is the Invite reward automatic?",
      a: "No, after your invited friend makes a payment, you need to manually claim the reward by clicking the 'Claim' button on the Invite & Earn page.",
    },
  ];

  return (
    <div className="min-h-screen mt-12 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold">Help & Support</h1>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg">
                <p className="font-semibold">{faq.q}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="flex space-x-4">
            <a
              href="mailto:skaltmash3@gmail.com"
              className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700"
            >
              <FiMail />
            </a>
            <a
              href="https://www.linkedin.com/in/altamash-sheikh-1ba6a72aa"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <FiLinkedin />
            </a>
            <a
              href="https://github.com/SkAltmash"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-800 text-white hover:bg-black"
            >
              <FiGithub />
            </a>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Transactions</h2>
          {loading && transactions.length === 0 ? (
            <Skeleton />
          ) : transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => navigate(`/help/${tx.id}`)}
                  className="cursor-pointer p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow hover:shadow-md flex justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {tx.note || tx.type} - ₹{Math.abs(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.timestamp?.toDate().toLocaleString() || "—"}
                    </p>
                  </div>
                  <span
                    className={`text-sm ${
                      tx.amount < 0
                        ? "text-red-500"
                        : tx.type === "receive"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {tx.type.toUpperCase()}
                  </span>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => fetchTransactions(false)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
