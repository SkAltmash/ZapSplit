import React from "react";
import { FiChevronRight, FiZap, FiUserPlus, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ReferralProgram = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/referral-details");
  };

   return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mt-1 rounded-b-xl p-6 sm:p-8 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-2xl font-bold">
        <FiZap className="text-yellow-300" />
        <span>Zap Referral</span>
      </div>

      {/* Description */}
      <p className="text-sm text-purple-100">
        Invite your friends to join the vibe on ZapSplit and earn rewards when they make their first payment!
      </p>

      {/* Steps & Animation */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Steps */}
        <div className="space-y-4 md:w-1/2">
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
            <p>
              You earn <span className="font-semibold">₹201</span> instantly
            </p>
          </div>
        </div>

        {/* Animation */}
        <div className="md:w-1/2">
          <iframe
            className="rounded-2xl bg-pink-300 w-full h-48 md:h-full"
            src="https://lottie.host/embed/cac7a69c-0db7-41a4-9cbe-d5c087af4773/XY0NhHuVRt.lottie"
            title="Zap Referral Animation"
          ></iframe>
        </div>
      </div>

      {/* Button */}
      <div className="flex ">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-3 bg-pink-200 text-black font-medium rounded-lg shadow hover:bg-yellow-300 transition"
        >
          View More <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ReferralProgram;



