import React from "react";
import { FiChevronRight, FiZap, FiUserPlus, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ReferralProgram = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/referral-details");
  };

  return (
    <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white  mt-5 rounded-xl p-6 sm:p-8 shadow-lg space-y-6">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <FiZap className="text-yellow-300" />
        Zap Referral
      </div>

      <p className="text-sm text-purple-100">
        Invite your friends to join the vibe on ZapSplit and earn rewards when they make their first payment!
      </p>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <FiUserPlus className="mt-1 text-green-300" />
          <p>Invite a friend to ZapSplit</p>
        </div>
        <div className="flex items-start gap-3">
          <FiCheckCircle className="mt-1 text-blue-300" />
          <p>They make their first payment</p>
        </div>
        <div className="flex items-start gap-3">
          <FiZap className="mt-1 text-yellow-300" />
          <p>You earn <span className="font-semibold">₹201</span> instantly</p>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="flex justify-center items-center gap-2 px-4 py-3 bg-yellow-400 text-black font-medium rounded-lg shadow hover:bg-yellow-300 transition"
      >
        View More <FiChevronRight />
      </button>
    </div>
  );
};

export default ReferralProgram;
