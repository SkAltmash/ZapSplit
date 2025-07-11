import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const ApplyPayLater = () => {
  const [loading, setLoading] = useState(false);
  const [income, setIncome] = useState("");
  const [occupation, setOccupation] = useState("");
  const [pan, setPan] = useState("");
  const navigate = useNavigate();

  const isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);

  const handleApply = async () => {
    if (!income || !occupation || !pan) {
      toast.error("Please fill all the details.");
      return;
    }

    if (!isValidPAN(pan)) {
      toast.error("Invalid PAN number.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You need to log in.");
        navigate("/login");
        return;
      }

      const incomeNum = parseInt(income);

      let approved = false;
      let approvedLimit = 0;

      if (incomeNum >= 15000) {
        approved = true;
        if (incomeNum >= 50000) approvedLimit = 30000;
        else if (incomeNum >= 30000) approvedLimit = 20000;
        else approvedLimit = 10000;
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        payLaterAppliedAt: new Date(),
        occupation,
        income: incomeNum,
        pan,
        payLaterEnabled: approved,
        creditLimit: approved ? approvedLimit : 0,
        usedCredit: 0,
        payLaterStatus: approved ? "approved" : "rejected",
      });

      if (approved) {
        toast.success(`Approved! ZupPayLater Limit: ₹${approvedLimit}`);
        navigate("/dashboard");
      } else {
        toast.error("Sorry, you’re not eligible for ZupPayLater at this time.");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6"
      >
        <h1 className="text-2xl font-bold text-purple-600 text-center">
          Apply for ZupPayLater
        </h1>
        <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
          Enter your details to check eligibility for ZupPayLater.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium dark:text-white">Occupation</label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded dark:bg-[#2a2a2a] dark:text-white"
            >
              <option value="">Select Occupation</option>
              <option value="salaried">Salaried</option>
              <option value="self-employed">Self-Employed</option>
              <option value="student">Student</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium  dark:text-white">Monthly Income (₹)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g. 20000"
              className="w-full mt-1 px-3 py-2 border rounded dark:bg-[#2a2a2a] dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium  dark:text-white">PAN Card Number</label>
            <input
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              className="w-full mt-1 px-3 py-2 border rounded dark:bg-[#2a2a2a] dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={loading}
          className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 w-full disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check & Apply"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="mt-3 text-xs text-gray-500 hover:underline block mx-auto"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
};

export default ApplyPayLater;
