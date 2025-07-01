import { useState } from "react";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success("Logged in successfully!");
      navigate("/"); 
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl px-8 py-10"
      >
        <h2 className="text-3xl font-bold mb-1 text-center text-purple-600 dark:text-purple-400">
          Login
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Welcome back to ZapSplit
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 transition text-white font-medium py-2.5 rounded-md ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
