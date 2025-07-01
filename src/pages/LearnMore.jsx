import { useEffect } from "react";

const LearnMore = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-gray-100 px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-purple-600 dark:text-purple-400">
          What is ZapSplit?
        </h1>
        <p className="text-lg mb-4 leading-relaxed">
          ZapSplit is your all-in-one wallet-powered payment splitter. Pay your friends,
          flatmates, or your cat (if they have a UPI ID). Add money to your ZapWallet,
          split expenses instantly, and hear that satisfying "zuppppp" sound every time
          you send money.
        </p>
        <p className="text-lg mb-4 leading-relaxed">
          We're not a bank (yet), but we do our best to feel as slick and secure as one.
          With lightning-fast zaps, sleek UI, and zero hidden fees — it's built for the future.
        </p>

        <hr className="my-10 border-gray-300 dark:border-gray-600" />

        <h2 className="text-2xl font-semibold mb-4">Terms & Conditions (Just for Fun)</h2>
        <ul className="list-disc ml-6 space-y-3 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            Do not attempt to zap ₹1 crore to your friend just to see if it works.
            Spoiler: it doesn’t. Yet.
          </li>
          <li>
            If you hear a "zuppppp" sound and feel joy, that’s completely normal.
            It means you’re now a certified ZapMaster™.
          </li>
          <li>
            Any money lost while attempting to pay pizza bills during IPL finals is
            on you. We can't recover emotional losses.
          </li>
          <li>
            Please don't name your UPI ID "give.me.money@zap". That’s confusing for support.
          </li>
          <li>
            We take security seriously — even if our jokes aren’t. Your data and
            wallet are encrypted tighter than your roommate’s budget.
          </li>
          <li>
            Refunds? We don’t handle that. Ask your friend nicely. Maybe send a meme.
          </li>
        </ul>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          * By using ZapSplit, you agree to all the above nonsense and the serious
          stuff in our real Privacy Policy. Use responsibly.
        </p>

        <div className="mt-10">
          <a
            href="/"
            className="inline-block text-sm font-medium bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;
