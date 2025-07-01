import { motion } from "framer-motion";

const steps = [
  {
    title: "Load Your Wallet",
    desc: "Add funds securely using Razorpay or UPI. Manage your balance anytime.",
  },
  {
    title: "Split with Friends",
    desc: "Create groups, define amounts or percentages, and track who owes what.",
  },
  {
    title: "Send via UPI Instantly",
    desc: "Pay any UPI ID straight from your ZapSplit wallet. Fast and secure.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="w-full py-20 px-6 bg-gray-100 dark:bg-[#0e0e0e] transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
        >
          How ZapSplit Works
        </motion.h2>

        <div className="relative border-l border-gray-300 dark:border-white/10 ml-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="mb-12 pl-8 relative"
            >
              <div className="absolute left-[-24px] top-1 w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold shadow-md">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
