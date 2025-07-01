import React from 'react'
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import PublicHomepage from './PublicHomepage';
import Dashboard from './Dashboard';
function Homepage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
   useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d]">
        <p className="text-gray-700 dark:text-white">Checking user...</p>
      </div>
    );
  }
 return user ? <Dashboard /> : <PublicHomepage />;
}

export default Homepage