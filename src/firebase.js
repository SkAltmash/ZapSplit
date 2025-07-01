import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDV0dsWraQRBwqVHzb0ruL6qT3UjXUPe5E",
  authDomain: "zapsplit.firebaseapp.com",
  projectId: "zapsplit",
  storageBucket: "zapsplit.firebasestorage.app",
  messagingSenderId: "544365701070",
  appId: "1:544365701070:web:ed1bdc5cb413867270ad9f",
  measurementId: "G-6W5SN3B2FH",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
