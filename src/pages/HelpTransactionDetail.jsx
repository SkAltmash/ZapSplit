import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSend, FiRotateCw } from "react-icons/fi";

const HelpTransactionDetail = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const initialMessages = [
    { from: "bot", message: "👋 Hello! How can I help you today?" },
  ];

  const initialOptions = [
    { id: "fail", label: "Transaction failed" },
    { id: "delay", label: "Money debited but not received" },
    { id: "receipt", label: "Need a receipt" },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [options, setOptions] = useState(initialOptions);
  const [userTurn, setUserTurn] = useState(true);

  const handleOptionClick = (option) => {
    setMessages((prev) => [...prev, { from: "user", message: option.label }]);
    setUserTurn(false);

    setTimeout(() => {
      let botReply = "";
      let nextOptions = [];

      switch (option.id) {
        case "fail":
          botReply =
            "If your transaction failed, please check your balance and try again. If the issue persists, contact support.";
          nextOptions = [
            { id: "more", label: "I have another question" },
            { id: "contact", label: "Contact Support" },
          ];
          break;
        case "delay":
          botReply =
            "Sometimes it takes a few minutes for the money to appear in the recipient's account. If it still doesn’t show, please contact our support team.";
          nextOptions = [
            { id: "more", label: "I have another question" },
            { id: "contact", label: "Contact Support" },
          ];
          break;
        case "receipt":
          botReply =
            "Here is your transaction receipt. You can view and download it below.";
          nextOptions = [];
          break;
        case "more":
          botReply = "Sure, please select your question below.";
          nextOptions = initialOptions;
          break;
        case "contact":
          botReply =
            "You can contact us at support@zapsplit.com or on LinkedIn & GitHub (links on our website).";
          nextOptions = [
            { id: "more", label: "I have another question" },
          ];
          break;
        default:
          botReply = "Sorry, I didn’t understand that.";
          nextOptions = initialOptions;
      }

      setMessages((prev) => [
        ...prev,
        { from: "bot", message: botReply, id: option.id },
      ]);
      setOptions(nextOptions);
      setUserTurn(true);
    }, 1000);
  };

  const restartChat = () => {
    setMessages(initialMessages);
    setOptions(initialOptions);
    setUserTurn(true);
  };

  useEffect(() => {
    if (!transactionId) {
      navigate("/help");
    }
  }, [transactionId, navigate]);

  return (
    <div className="w-screen bg-[#eee] dark:bg-[#1b1b2c]">
       <div className=" h-[calc(100vh-3rem)] mt-12 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white flex flex-col max-w-[400px] m-auto">
      <header className="p-4 bg-purple-600 text-white font-semibold text-lg flex justify-between items-center">
        Help Center
        <button
          onClick={restartChat}
          className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
        >
          <FiRotateCw /> Restart Chat
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-2 ">
        {messages.map((node, index) => (
          <div
            key={index}
            className={`flex ${
              node.from === "bot" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`p-3 rounded-lg shadow max-w-xs text-sm ${
                node.from === "bot"
                  ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white"
                  : "bg-purple-600 text-white"
              }`}
            >
              <p className="whitespace-pre-line">{node.message}</p>

              {/* Receipt button */}
              {node.id === "receipt" && (
                <button
              onClick={() => navigate(`/transaction/${transactionId}`)}
                  className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                >
                  View Receipt
                </button>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="p-3 border-t flex gap-2 bg-white dark:bg-[#1a1a1a]">
        {userTurn ? (
          <div className="flex gap-2 flex-wrap">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm flex items-center gap-1">
            <FiSend className="animate-spin" /> Typing…
          </div>
        )}
      </footer>
    </div>
    </div>
  );
};

export default HelpTransactionDetail;
