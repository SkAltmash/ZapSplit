import { useSearchParams } from "react-router-dom";

const Success = () => {
  const [params] = useSearchParams();
  const amount = params.get("amount");
  const paymentId = params.get("paymentId");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">✅ Payment Successful!</h1>
      <p className="text-lg mb-2">Amount: ₹{amount}</p>
      <p className="text-sm text-gray-500">Payment ID: {paymentId}</p>
      <a
        href="/"
        className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
      >
        Back to Home
      </a>
    </div>
  );
};

export default Success;
