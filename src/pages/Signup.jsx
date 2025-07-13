import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { toast } from "react-hot-toast";
const Signup = () => {
  const [form, setForm] = useState({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refOwner, setRefOwner] = useState(null);
  const [checkingRef, setCheckingRef] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const checkReferral = async (code) => {
    if (!code) {
      setRefOwner(null);
      return;
    }
    setCheckingRef(true);
    const q = query(collection(db, "users"), where("referralCode", "==", code.trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const owner = snap.docs[0].data();
      setRefOwner(owner);
    } else {
      setRefOwner(false);
    }
    setCheckingRef(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error("Enter a valid Indian mobile number");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.referralCode && refOwner === false) {
      toast.error("Invalid referral code.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email: form.email,
        mobile: form.mobile,
        wallet: 0,
        createdAt: new Date(),
        invitedBy: form.referralCode || null,
      });

      toast.success("Account created successfully!");
      window.location.href = "/profile-setup";
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.referralCode.trim()) {
      const timeout = setTimeout(() => checkReferral(form.referralCode), 500);
      return () => clearTimeout(timeout);
    } else {
      setRefOwner(null);
    }
  }, [form.referralCode]);

  return (
    <div className="min-h-screen bg-white mt-12 py-4 dark:bg-[#0d0d0d] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl px-8 py-10"
      >
        <h2 className="text-3xl font-bold mb-1 text-center text-purple-600 dark:text-purple-400">
          Sign Up
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Join ZapSplit to zap smarter.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              Mobile Number
            </label>
            <input
              name="mobile"
              type="tel"
              required
              value={form.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span
                onClick={() => setShowPass(!showPass)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-sm text-purple-500"
              >
                {showPass ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type={showPass ? "text" : "password"}
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
              Referral Code (optional)
            </label>
            <input
              name="referralCode"
              type="text"
              value={form.referralCode}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {checkingRef ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Checking code...</p>
            ) : refOwner === false ? (
              <p className="text-xs text-red-500 mt-1">Invalid referral code</p>
            ) : refOwner ? (
              <p className="text-xs text-green-600 mt-1">
                Referred by: {refOwner.displayName || refOwner.email || "User"}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 transition text-white font-medium py-2.5 rounded-md ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
