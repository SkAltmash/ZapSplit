import { motion } from "framer-motion";
import { CreditCard, Users, Send, TrendingUp, Gift, BarChart2, Bell } from "lucide-react";

const steps = [
  {
    title: "Load Your Wallet",
    desc: "Add funds securely using Razorpay or UPI. Manage your balance anytime.",
    icon: <CreditCard size={20} />,
  },
  {
    title: "Split with Friends",
    desc: "Create groups, define amounts or percentages, and track who owes what.",
    icon: <Users size={20} />,
  },
  {
    title: "Send via UPI Instantly",
    desc: "Pay any UPI ID straight from your ZapSplit wallet. Fast and secure.",
    icon: <Send size={20} />,
  },
  {
    title: "Zap PayLater",
    desc: "Use credit even when your wallet is empty. Pay your dues later easily.",
    icon: <TrendingUp size={20} />,
  },
  {
    title: "Referral Program",
    desc: "Invite friends, they complete their first payment, you earn ₹201.",
    icon: <Gift size={20} />,
  },
  {
    title: "Track Analytics",
    desc: "Understand where your money goes with detailed spending analytics.",
    icon: <BarChart2 size={20} />,
  },
  {
    title: "Real-Time Notifications",
    desc: "Get instantly notified about transactions, splits, and rewards.",
    icon: <Bell size={20} />,
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
              <div className="flex items-center gap-2 mb-1">
                <div className="text-purple-600 dark:text-purple-400">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{step.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
