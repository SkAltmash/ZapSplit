import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const faqItems = [
  {
    question: "How do I add money to my ZapSplit wallet?",
    answer:
      "You can add money using UPI or Razorpay. Once added, it reflects in your wallet instantly.",
  },
  {
    question: "Can I send money to anyone using UPI?",
    answer:
      "Yes, ZapSplit lets you transfer funds from your wallet to any valid UPI ID.",
  },
  {
    question: "Is my money secure in ZapSplit?",
    answer:
      "Absolutely. We use top-tier security and payment infrastructure to ensure your funds are safe.",
  },
  {
    question: "Does ZapSplit charge any fees?",
    answer:
      "ZapSplit is free for most personal transfers. For larger transactions or business use, fees may apply.",
  },
];

const FAQItem = ({ item, isOpen, toggle }) => (
  <div className="border-b border-gray-200 dark:border-white/10 py-4">
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between text-left"
    >
      <span className="text-lg font-medium text-gray-800 dark:text-white">
        {item.question}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-purple-600 dark:text-purple-400"
      >
        <FiChevronDown size={20} />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-2 text-sm text-gray-600 dark:text-gray-300"
        >
          {item.answer}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="w-full py-20 px-6 bg-white dark:bg-[#111] transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              toggle={() => toggleIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
