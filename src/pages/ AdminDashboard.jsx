import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  FiBell,
  FiUsers,
  FiDollarSign,
  FiGift,
  FiLoader,
} from "react-icons/fi";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data()?.role === "admin") {
        setIsAdmin(true);
      } else {
        toast.error("You are not authorized to access admin dashboard");
        navigate("/");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-black">
        <FiLoader className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return <div className="p-4">You are not authorized.</div>;
  }

  const adminCards = [
    {
      title: "Send Notifications",
      desc: "Broadcast messages or updates to users.",
      icon: <FiBell className="text-3xl text-purple-600" />,
      link: "/admin/notifications",
      bg: "bg-purple-50 hover:bg-purple-100",
    },
    {
      title: "View Users",
      desc: "Manage and view registered users.",
      icon: <FiUsers className="text-3xl text-blue-600" />,
      link: "/admin/users",
      bg: "bg-blue-50 hover:bg-blue-100",
    },
  ];

  return (
     <div className="h-screen w-screen dark:bg-black p-4">
        <div className="max-w-6xl mx-auto p-4 mt-15 dark:bg-[#0d0d0d] rounded-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">Admin Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {adminCards.map((card, idx) => (
          <Link
            to={card.link}
            key={idx}
            className={`rounded-xl p-6 shadow transition transform hover:scale-[1.02] ${card.bg}`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div>{card.icon}</div>
              <h2 className="text-xl font-semibold ">{card.title}</h2>
            </div>
            <p className="text-sm text-gray-700">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>

     </div>
  );
};

export default AdminDashboard;
