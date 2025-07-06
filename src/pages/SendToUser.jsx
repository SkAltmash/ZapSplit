import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { FiArrowLeft } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import ChatInput from "../components/ChatInput";

const SendToUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      if (!u) return;

      setCurrentUser(u);

      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (!snap.exists()) {
          navigate("/send");
          return;
        }

        const rec = { id: snap.id, ...snap.data() };
        setRecipient(rec);

        const convoId =
          u.uid < rec.id ? `${u.uid}_${rec.id}` : `${rec.id}_${u.uid}`;
        setConversationId(convoId);

        const msgRef = collection(db, "conversations", convoId, "messages");
        const q = query(msgRef, orderBy("timestamp", "asc"));

        const unsubMsgs = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(msgs);
        });

        return () => unsubMsgs();
      } catch (err) {
        console.error("Error fetching conversation/messages", err);
      }
    });

    return () => unsubAuth();
  }, [userId, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!recipient || !currentUser) return <div className="p-6">Loading...</div>;

  return (
    <div className="bg-[#eee] dark:bg-[#1b1b1b]">
      <div className="h-[calc(100vh-3rem)] w-screen max-w-[500px] m-auto flex flex-col bg-gray-100 dark:bg-[#0d0d0d] mt-12">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1a1a1a] shadow-md">
          <button onClick={() => navigate(-1)}>
            <FiArrowLeft className="text-xl text-purple-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center overflow-hidden">
              {recipient.photoURL ? (
                <img
                  src={recipient.photoURL}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{recipient.name?.[0]}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm dark:text-white">
                {recipient.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-200">
                {recipient.email}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
        >
          {messages.map((msg, i) => {
            const isSent = msg.from === currentUser.uid;
            
            const msgType = msg.type?.toLowerCase().trim();
            const msgStatus = msg.status?.toLowerCase().trim();

            const bgClass =
              msgType === "payment"
                ? msgStatus === "failed"
                  ? "bg-red-600 text-white border-red-700" // 🔴 failed
                  : "bg-green-600 text-white border-green-700" // 🟢 success
                : isSent
                ? "bg-purple-600 text-white border-purple-500" // 🟣 normal sent msg
                : "bg-gray-200 dark:bg-[#2a2a2a] text-gray-800 dark:text-white border-transparent"; // 🩶 normal received msg

            return (
              <div
                key={i}
                className={`flex ${isSent ? "justify-end" : "justify-start"}`}
              >
                <div
                  onClick={() => {
                    if (msg.txnId) {
                      navigate(`/transaction/${msg.txnId}`, { state: msg });
                    }
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 max-w-[70%] text-sm shadow border transition-transform hover:scale-[1.02] ${bgClass}`}
                >
                  {msg.amount && (
                    <p className="font-bold">₹{Math.abs(msg.amount)}</p>
                  )}

                  {msg.note && (
                    <p className="text-xs mt-1 opacity-80 break-words">
                      {msg.note}
                    </p>
                  )}

                  {msg.text && !msg.amount && (
                    <p className="break-words">{msg.text}</p>
                  )}

                  <p className="text-[10px] text-right mt-1 opacity-60">
                    {msg.timestamp?.toDate
                      ? formatDistanceToNow(
                          new Date(msg.timestamp.toDate()),
                          {
                            addSuffix: true,
                          }
                        )
                      : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <ChatInput conversationId={conversationId} recipientId={recipient.id} />
      </div>
    </div>
  );
};

export default SendToUser;
