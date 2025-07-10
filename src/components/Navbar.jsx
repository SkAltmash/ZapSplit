import { useState, useEffect, useRef } from "react";
import {
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiUser,
  FiBarChart2,
  FiCamera,
  FiHelpCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import Notifications from "./Notifications";
import SplitButton from "./SplitButton";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const popoverRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const togglePopover = () => setPopoverOpen(!popoverOpen);
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <nav className="w-full fixed top-0 left-0 z-50 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            <Link to="/">ZapSplit</Link>
          </div>

          <div className="hidden md:flex items-center gap-4 relative">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/20 px-4 py-1.5 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-purple-600 text-white dark:bg-purple-500 px-4 py-1.5 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Notifications />
                <SplitButton />

                <button
                  onClick={togglePopover}
                  className="flex items-center gap-2 relative"
                >
                  <img
                    src={user.photoURL || "https://i.pravatar.cc/100"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                <AnimatePresence>
                  {popoverOpen && (
                    <motion.div
                      ref={popoverRef}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-12 bg-white dark:bg-[#222] shadow-lg rounded-lg w-48 py-2 z-50"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
                        onClick={() => setPopoverOpen(false)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FiUser /> Profile
                        </span>
                      </Link>

                      <Link
                        to="/scan-pay"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
                        onClick={() => setPopoverOpen(false)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FiCamera /> Scan & Pay
                        </span>
                      </Link>

                      <Link
                        to="/help"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
                        onClick={() => setPopoverOpen(false)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FiHelpCircle /> Help
                        </span>
                      </Link>

                      <Link
                        to="/analysis"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
                        onClick={() => setPopoverOpen(false)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FiBarChart2 /> Analysis
                        </span>
                      </Link>

                      <button
                        onClick={() => {
                          toggleDarkMode();
                          setPopoverOpen(false);
                        }}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
                      >
                        {darkMode ? <FiSun className="mr-2" /> : <FiMoon className="mr-2" />}
                        Theme
                      </button>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-800/20"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          <button
            className="md:hidden text-2xl text-gray-700 dark:text-gray-300"
            onClick={toggleDrawer}
          >
            {drawerOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={toggleDrawer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              drag="x"
              dragConstraints={{ left: -200, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.x > 100) setDrawerOpen(false);
              }}
              className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-[#111] shadow-lg z-50 flex flex-col p-6 pt-20 space-y-4"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {!user ? (
                <>
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 text-2xl text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    {darkMode ? <FiSun /> : <FiMoon />}
                  </button>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/20 px-4 py-2 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium bg-purple-600 text-white dark:bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photoURL || "https://i.pravatar.cc/100"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2 justify-center items-center">
                    <button
                      onClick={toggleDarkMode}
                      className="flex items-center gap-2 text-2xl text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      {darkMode ? <FiSun /> : <FiMoon />}
                    </button>
                    <Notifications />
                    <SplitButton />
                  </div>

                  <div className="border-t border-gray-200 dark:border-white/10 my-4" />

                  <Link
                    onClick={toggleDrawer}
                    to="/profile"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiUser /> Profile
                    </span>
                  </Link>

                  <Link
                    onClick={toggleDrawer}
                    to="/analysis"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiBarChart2 /> Analysis
                    </span>
                  </Link>

                  <Link
                    onClick={toggleDrawer}
                    to="/scan-pay"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiCamera /> Scan & Pay
                    </span>
                  </Link>

                  <Link
                    to="/help"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                    onClick={toggleDrawer}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiHelpCircle /> Help
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-600 border border-red-300 dark:border-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/20 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
