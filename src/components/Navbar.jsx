import { useState, useEffect } from "react";
import { FiMenu, FiX, FiMoon, FiSun } from "react-icons/fi";
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <nav className="w-full fixed top-0 left-0 z-50 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            <a href="/">ZapSplit</a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <a
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/20 px-4 py-1.5 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition"
                >
                  Log In
                </a>
                <a
                  href="/signup"
                  className="text-sm font-medium bg-purple-600 text-white dark:bg-purple-500 px-4 py-1.5 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition"
                >
                  Sign Up
                </a>
              </>
            ) : (
              <>
                <Link to="/profile" className="flex items-center gap-2">
                  <img
                    src={user.photoURL || "https://i.pravatar.cc/100"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>

                <div className="flex items-center gap-2 ml-2">
                  <Notifications />
                  <SplitButton />
                </div>

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg border border-gray-300 dark:border-white/20 hover:border-red-500 dark:hover:border-red-400 transition"
                >
                  Logout
                </button>
              </>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {darkMode ? (
                <FiSun className="text-yellow-400" />
              ) : (
                <FiMoon className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <button
            className="md:hidden text-2xl text-gray-700 dark:text-gray-300"
            onClick={toggleDrawer}
          >
            {drawerOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
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
              className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-[#111] shadow-lg z-50 flex flex-col p-6 pt-20 space-y-4"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {!user ? (
                <>
                  <a
                    href="/login"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/20 px-4 py-2 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition"
                  >
                    Log In
                  </a>
                  <a
                    href="/signup"
                    className="text-sm font-medium bg-purple-600 text-white dark:bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition"
                  >
                    Sign Up
                  </a>
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

                  <div className="flex  gap-3 mt-2 justify-center align-middle">
                   
                    <div>
                    <button
                    onClick={toggleDarkMode}
                     className="flex items-center gap-2 mt-2 text-2xl text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                     >
                    {darkMode ? <FiSun /> : <FiMoon />}
                    </button>
                    </div>
                     <Notifications onClick={toggleDrawer} />
                    <SplitButton onClick={toggleDrawer} />
                  </div>

                  <div className="border-t border-gray-200 dark:border-white/10 my-4" />

                  <Link
                    onClick={toggleDrawer}
                     to="/profile"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    Profile
                  </Link>

                  <Link
                  onClick={toggleDrawer}
                  to="/scan-pay"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    Scan & Pay
                  </Link>

                  <Link
                    to="/help"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                    onClick={toggleDrawer}
                  >
                    Help
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
