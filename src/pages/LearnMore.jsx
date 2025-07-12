import { useEffect } from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const LearnMore = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-gray-100 px-6 py-20">
      <div className="max-w-4xl mx-auto">

        {/* Title */}
        <h1 className="text-4xl font-bold mb-6 text-purple-600 dark:text-purple-400">
          What is ZapSplit?
        </h1>

        <p className="text-lg mb-4 leading-relaxed">
          ZapSplit is your all-in-one wallet-powered payment splitter. Pay your friends,
          flatmates, or even your cat (if they have a UPI ID). Add money to your ZapWallet,
          split expenses instantly, and enjoy that satisfying sound every time
          you send money.
        </p>
        <p className="text-lg mb-4 leading-relaxed">
          We’re not a bank (yet), but we aim to feel just as slick and secure. 
          With lightning-fast zaps, a sleek UI, and no hidden fees — it’s built for you.
        </p>

        {/* Mascot */}
        <div className="w-full flex justify-center my-8">
          <img
            src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zappy"
            alt="ZapSplit Mascot"
            className="w-32 h-32"
          />
        </div>

        <hr className="my-10 border-gray-300 dark:border-gray-600" />

        {/* Terms of Service */}
        <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
        <ul className="list-disc ml-6 space-y-2 text-base text-gray-700 dark:text-gray-300">
          <li>ZapSplit does not store UPI PINs or credentials.</li>
          <li>All wallet transactions are securely encrypted.</li>
          <li>We don’t process refunds — kindly resolve with the recipient.</li>
          <li>Abuse of the platform may lead to account suspension.</li>
          <li>By using ZapSplit, you agree to these terms.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">Fun Notes</h3>
        <ul className="list-disc ml-6 space-y-2 text-base text-gray-700 dark:text-gray-300">
          <li>Don’t try to zap ₹1 crore just for fun. It won’t work (yet).</li>
          <li>If you smile when you hear the zap sound, you’re officially a ZapMaster™.</li>
          <li>Pizza + IPL + ZapSplit = handle with care.</li>
          <li>No fake UPI IDs like “give.me.money@zap”, please.</li>
          <li>Your data is more secure than your flatmate’s fridge.</li>
          <li>Need a refund? Send a meme — it helps more than emails.</li>
        </ul>

        <hr className="my-10 border-gray-300 dark:border-gray-600" />

        {/* Privacy Policy */}
        <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
        <p className="text-base mb-4 text-gray-700 dark:text-gray-300">
          We take privacy seriously. Here’s what you should know:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-base text-gray-700 dark:text-gray-300">
          <li>Your personal information is securely stored and never sold.</li>
          <li>UPI credentials and PINs are never collected or saved.</li>
          <li>All payment actions are encrypted and timestamped.</li>
          <li>ZapSplit uses Firebase for authentication and Firestore for secure data.</li>
        </ul>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          ZapSplit is built for education and demonstration purposes only.
        </p>

        <hr className="my-10 border-gray-300 dark:border-gray-600" />

        {/* Creator Info */}
        <h2 className="text-2xl font-semibold mb-4">About the Creator</h2>
        <p className="text-base mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          Hi, I’m <strong>Altamash Sheikh</strong>, a self-taught developer and creator of ZapSplit.
          I love building apps that solve real problems while keeping them fun and easy to use.
        </p>
        <p className="text-base mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          I started with simple HTML & JavaScript, discovered Firebase, and now craft full-stack apps like ZapSplit
          that feel like magic.
        </p>

        {/* Social Links */}
        <div className="mt-4 flex gap-4 text-lg text-purple-600 dark:text-purple-400">
          <a
            href="https://github.com/SkAltmash"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-800 transition"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/altamash-sheikh-1ba6a72aa"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-800 transition"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://x.com/AltmashThe6081"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-800 transition"
          >
            <FaTwitter />
          </a>
        </div>

        {/* Back Button */}
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
