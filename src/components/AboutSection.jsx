import { motion } from "framer-motion";
import { FiUploadCloud, FiUsers, FiSend } from "react-icons/fi";

const AboutSection = () => {
  const features = [
    {
      title: "Load Your Wallet",
      desc: "Add money using Razorpay or UPI and keep it safe inside your ZapSplit wallet.",
      icon: <FiUploadCloud size={28} />,
    },
    {
      title: "Split with Friends",
      desc: "Create groups, assign shares, and let ZapSplit calculate who owes what.",
      icon: <FiUsers size={28} />,
    },
    {
      title: "Send via UPI Instantly",
      desc: "Pay any UPI ID directly from your wallet. Fast, secure, and real-time.",
      icon: <FiSend size={28} />,
    },
  ];

  return (
    <section className="w-full py-20 px-6 bg-white dark:bg-[#111] transition-colors duration-300">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
        >
          What is ZapSplit?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-12"
        >
          ZapSplit is your all-in-one money splitting solution. Easily top up your wallet, divide expenses with others, and send real money to any UPI ID — in just a few taps.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
              className="bg-gray-50 dark:bg-[#1b1b1b] p-6 rounded-2xl shadow hover:shadow-md transition border border-gray-200 dark:border-white/10"
            >
              <div className="text-purple-600 dark:text-purple-400 mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
