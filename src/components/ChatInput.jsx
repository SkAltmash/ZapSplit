import { useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ChatInput = ({ conversationId, recipientId }) => {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const user = auth.currentUser;

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const isPayment = /^\d+$/.test(text);

    if (isPayment) {
      navigate(`/pay/${recipientId}/${text}`);
      return;
    }

    try {
      setSending(true);
      const msgRef = collection(
        db,
        "conversations",
        conversationId,
        "messages"
      );

      await addDoc(msgRef, {
        text,
        from: user.uid,
        to: recipientId,
        timestamp: serverTimestamp(),
      });

      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-3 border-t bg-white dark:bg-[#1a1a1a]">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message or amount…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="
            flex-1
            px-4 py-2
            rounded-lg
            border
            dark:bg-[#2a2a2a]
            dark:text-white
            text-sm
            focus:outline-none focus:ring-2 focus:ring-purple-500
            w-full
            min-w-0
          "
          style={{
            maxWidth: "100%",
          }}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {/^\d+$/.test(input.trim()) ? "Pay" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
