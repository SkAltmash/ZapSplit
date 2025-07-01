import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#111] border-t border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-10 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        {/* Column 1: Logo + Description */}
        <div>
          <h3 className="text-xl font-bold  text-purple-700 dark:text-purple-400 mb-2">ZapSplit</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Split Smarter. Zap Faster. Built for modern, secure UPI payments.
          </p>
        </div>


        {/* Column 3: Legal & Social */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legal & Social</h4>
          <ul className="space-y-1">
            <li><a href="/learn-more" className="hover:text-purple-600 dark:hover:text-purple-400">Privacy Policy</a></li>
            <li><a href="/learn-more" className="hover:text-purple-600 dark:hover:text-purple-400">Terms of Service</a></li>
          </ul>
          <div className="flex gap-4 mt-4">
            <a href="#" target="_blank" className="hover:text-purple-600 dark:hover:text-purple-400">
              <FaGithub size={18} />
            </a>
            <a href="#" target="_blank" className="hover:text-purple-600 dark:hover:text-purple-400">
              <FaLinkedin size={18} />
            </a>
            <a href="#" target="_blank" className="hover:text-purple-600 dark:hover:text-purple-400">
              <FaTwitter size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-xs mt-8 text-gray-500 dark:text-gray-500">
        © {new Date().getFullYear()} ZapSplit. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
