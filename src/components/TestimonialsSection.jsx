import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Aman Verma",
    role: "Student",
    quote:
      "ZapSplit made it super easy to split hostel expenses. No more tracking who owes what!",
    img: "https://i.pravatar.cc/100?img=3",
  },
  {
    name: "Sneha Kulkarni",
    role: "Freelancer",
    quote:
      "I love how quickly I can send money to clients or friends. The wallet + UPI combo is genius.",
    img: "https://i.pravatar.cc/100?img=10",
  },
  {
    name: "Raj Singh",
    role: "Roommate",
    quote:
      "We split rent, groceries, even Netflix — and all of it is done through ZapSplit now. So smooth.",
    img: "https://i.pravatar.cc/100?img=7",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="w-full py-20 px-6 bg-gray-50 dark:bg-[#0d0d0d] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Trusted by Users Across India
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow hover:shadow-md transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">{t.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                “{t.quote}”
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
