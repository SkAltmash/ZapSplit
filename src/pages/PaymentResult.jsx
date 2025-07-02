import { useLocation, useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiUser,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";
import { motion } from "framer-motion";

const PaymentResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state)
    return <p className="p-4 text-center text-red-500 font-medium">Invalid payment request</p>;

  const isSuccess = state.status === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d] px-4 text-gray-800 dark:text-white"
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border dark:border-white/10 text-center">

        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="mb-4"
        >
          {isSuccess ? (
            <FiCheckCircle className="mx-auto text-green-500 text-6xl animate-bounce" />
          ) : (
            <FiXCircle className="mx-auto text-red-500 text-6xl animate-shake" />
          )}
        </motion.div>

        {/* Status Heading */}
        <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? "text-green-500" : "text-red-500"}`}>
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </h2>

        {/* Payment Summary */}
        <p className="text-base mb-3">
          {isSuccess ? (
            <>
              You paid <span className="font-semibold">₹{state.amount}</span> to{" "}
              <span className="font-semibold">{state.recipientName}</span>
            </>
          ) : (
            state.reason || "Something went wrong"
          )}
        </p>

        {/* Optional Note */}
        {isSuccess && state.note && (
          <div className="text-sm italic text-gray-600 dark:text-gray-400 mb-4">
            “{state.note}”
          </div>
        )}

        {/* Extra Info Box */}
        <div className="text-left bg-gray-50 dark:bg-[#222] p-4 rounded-md text-sm space-y-2 border dark:border-white/10">
          <div className="flex items-center gap-2">
            <FiUser />
            <span>
              <strong>To:</strong> {state.recipientName || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiCreditCard />
            <span>
              <strong>Amount:</strong> ₹{state.amount || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiArrowLeft />
            <span>
              <strong>Status:</strong>{" "}
              <span className={isSuccess ? "text-green-500" : "text-red-500"}>
                {isSuccess ? "Success" : "Failed"}
              </span>
            </span>
          </div>
          {state.reason && !isSuccess && (
            <div className="flex items-center gap-2 text-red-400">
              <FiFileText />
              <span>
                <strong>Reason:</strong> {state.reason}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate(`/send/${state.recipientId}`)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition-all"
          >
            Send Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full border border-purple-600 text-purple-600 font-semibold py-2 rounded-md hover:bg-purple-50 dark:hover:bg-[#222] transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentResult;
