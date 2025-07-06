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
  getDocs,
} from "firebase/firestore";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import ChatInput from "../components/ChatInput";

const SendToUser = () => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedMsgs, setExpandedMsgs] = useState({});

  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      if (!u) return;

      setCurrentUser(u);

      const usersSnap = await getDocs(collection(db, "users"));
      const otherUsers = usersSnap.docs
        .filter((doc) => doc.id !== u.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(otherUsers);

      if (!routeUserId && otherUsers.length) {
        navigate(`/send/${otherUsers[0].id}`);
      }
    });

    return () => unsubAuth();
  }, [navigate, routeUserId]);

  useEffect(() => {
    if (!currentUser || !routeUserId) return;

    const fetchConversation = async () => {
      const snap = await getDoc(doc(db, "users", routeUserId));
      if (!snap.exists()) {
        navigate("/send");
        return;
      }

      const rec = { id: snap.id, ...snap.data() };
      setRecipient(rec);

      const convoId =
        currentUser.uid < rec.id
          ? `${currentUser.uid}_${rec.id}`
          : `${rec.id}_${currentUser.uid}`;
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
    };

    fetchConversation();
  }, [routeUserId, currentUser, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
  const el = scrollRef.current;
  if (el) {
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }
}, [messages]);
  const toggleExpand = (msgId) => {
    setExpandedMsgs((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };


  if (!currentUser) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-3rem)] mt-12 md:pt-4 bg-gray-100 dark:bg-[#0f0f0f]">
      {/* Sidebar (desktop only) */}
      <div className="hidden md:flex flex-col w-1/3 max-w-xs bg-white dark:bg-[#1a1a1a] border-r">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            className="w-full bg-transparent outline-none text-sm dark:text-white"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users
            .filter(
              (u) =>
                u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase())
            )
            .map((u) => (
              <div
                key={u.id}
                onClick={() => navigate(`/send/${u.id}`)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] ${
                  u.id === recipient?.id
                    ? "bg-gray-200 dark:bg-[#333]"
                    : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center overflow-hidden text-lg">
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{u.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#121212] shadow-sm border-b">
          {/* Mobile: back btn */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-purple-500"
          >
            <FiArrowLeft className="text-2xl" />
          </button>

          {recipient && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center overflow-hidden text-sm md:text-lg">
                {recipient?.photoURL ? (
                  <img
                    src={recipient.photoURL}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{recipient?.name?.[0]}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm md:text-base text-gray-800 dark:text-white">
                  {recipient?.name}
                </p>
                <p className="text-xs text-gray-500">{recipient?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f9f9f9] dark:bg-[#181818]"
        >
          {messages.map((msg) => {
            const isSent = msg.from === currentUser.uid;
            const msgType = msg.type?.toLowerCase().trim();
            const msgStatus = msg.status?.toLowerCase().trim();

            const maxContentLength = 50;
            const content =
              msg.text && !msg.amount ? msg.text : msg.note || "";
            const isLong = content.length > maxContentLength;
            const expanded = !!expandedMsgs[msg.id];

            const cardColor =
              msgType === "payment"
                ? msgStatus === "failed"
                  ? "border-red-400"
                  : "border-green-400"
                : isSent
                ? "border-purple-400"
                : "border-gray-400";

            return (
              <div
                key={msg.id}
                className={`flex ${isSent ? "justify-end" : "justify-start"}`}
              >
                <div
                
                  className={`cursor-pointer px-4 py-3 max-w-[80%] text-sm 
                    rounded-xl shadow-sm bg-white dark:bg-[#222] border-l-4 ${cardColor}
                    transition-transform transform hover:scale-[1.01]`}
                >
                  {msg.amount && (
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      ₹{Math.abs(msg.amount)}
                    </p>
                  )}

                  {content && (
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-200 break-words">
                      {expanded || content.length <= maxContentLength
                        ? content
                        : content.slice(0, maxContentLength) + "..."}
                    </p>
                  )}
               {msg.type === "payment" && (
               <button
              onClick={() => {
              if (msg.txnId) {
              navigate(`/transaction/${msg.txnId}`, { state: msg });
             }
              }}
            className="mt-2 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded shadow"
             >
                  Show Details
               </button>
               )}

                      
                

                  <p className="text-[10px] text-right mt-2 text-gray-400">
                    {msg.timestamp?.toDate
                      ? formatDistanceToNow(new Date(msg.timestamp.toDate()), {
                          addSuffix: true,
                        })
                      : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {recipient && (
          <ChatInput
            conversationId={conversationId}
            recipientId={recipient.id}
          />
        )}
      </div>
    </div>
  );
};

export default SendToUser;
