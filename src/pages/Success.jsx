import { useSearchParams } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

const Success = () => {
  const [params] = useSearchParams();
  const amount = params.get("amount");
  const paymentId = params.get("paymentId");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white px-4">
     <iframe
      className="w-full rounded-2xl mb-3"
      src="https://lottie.host/embed/32d214e8-ec1b-4da2-924e-8705344e13a8/SHbtp3KCfK.lottie"
    ></iframe>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Payment Successful!
      </h1>

      <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
        Your payment was processed successfully. Below are the details of your transaction.
      </p>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md p-6 w-full max-w-sm text-center">
        <p className="text-lg font-semibold mb-1">
          Amount Paid: <span className="text-purple-600">₹{amount}</span>
        </p>
        <p className="text-xs text-gray-500 break-all">
          Payment ID: {paymentId}
        </p>
      </div>

      <a
        href="/"
        className="mt-8 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
      >
        View Wallet
      </a>
    </div>
  );
};

export default Success;
