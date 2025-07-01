import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="w-full min-h-[90vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-purple-50 dark:from-[#0e0e0e] dark:to-[#1a1a1a] px-4 py-20 transition-colors duration-300">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-extrabold text-purple-700 dark:text-purple-400 mb-4"
      >
        Split Smarter. <br className="hidden md:block" /> <span className="text-black dark:text-white">Zap Faster.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl"
      >
        ZapSplit is your personal wallet to split, zap, and send money instantly. Add funds and pay any UPI in just a flash.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 space-x-4"
      >
        <button className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
          Get Started
        </button>
      <Link
  to="/learn-more"
  className="mt-6 inline-block px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg shadow hover:bg-purple-700 transition"
>
  Learn More
</Link>
      </motion.div>
    </section>
  );
};

export default Hero;
