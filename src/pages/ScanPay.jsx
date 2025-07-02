import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-hot-toast";
import { FiChevronRight } from "react-icons/fi";
import { Html5QrcodeScanner } from "html5-qrcode";

const ScanPay = () => {
  const [scannedData, setScannedData] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef(null);

  useEffect(() => {
    if (step === 1 && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: 250,
      });

      scanner.render(
        async (text) => {
          if (!text || scannedData) return;
          scanner.clear();
          setScannedData(text);
          await handleScan(text);
        },
        (err) => {
          console.warn("QR error:", err);
        }
      );

      scannerRef.current = scanner;
    }
  }, [step, scannedData]);

  const handleScan = async (data) => {
    setLoading(true);
    const extracted = extractUpiOrMobile(data);
    if (!extracted) {
      toast.error("Invalid QR or format");
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "users"), where(extracted.type, "==", extracted.value));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const foundUser = snap.docs[0];
        navigate(`/send/${foundUser.id}`);
      } else {
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      toast.error("Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGhostCreate = async () => {
    if (!name.trim()) return toast.error("Enter name");

    const { type, value } = extractUpiOrMobile(scannedData);
    const ghostId = `ghostscan_${value.replace(/\W+/g, "")}`;

    try {
      await setDoc(doc(db, "users", ghostId), {
        name,
        email: `${name}@zapghost.com`,
        [type]: value,
        isGhost: true,
        createdAt: new Date(),
        wallet: 0,
        photoURL: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=scan${ghostId}`,
      });

      navigate(`/send/${ghostId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ghost");
    }
  };

  const extractUpiOrMobile = (str) => {
    str = str.trim();
    if (str.includes("@")) {
      return { type: "upi", value: str };
    } else if (/^\d{10}$/.test(str)) {
      return { type: "mobile", value: str };
    } else {
      return null;
    }
  };

  return (
    <div className="min-h-screen mt-12 px-4 py-10 bg-white dark:bg-[#0d0d0d] text-gray-800 dark:text-white flex flex-col items-center">
      <div className="max-w-sm w-full bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow-md border dark:border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-center">Scan & Pay</h2>

        {step === 1 ? (
          <>
            <p className="text-sm mb-2 text-center text-gray-500">
              Allow camera access and scan a UPI QR or mobile number QR
            </p>
            <div id="qr-reader" className="w-full rounded-md overflow-hidden" />
            {loading && (
              <p className="text-center mt-3 text-sm text-purple-500">Processing scan...</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm mb-3 text-gray-500">
              User not found. Enter recipient name to continue:
            </p>
            <input
              type="text"
              placeholder="Recipient Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-md border dark:bg-[#2a2a2a] dark:text-white text-center"
            />
            <button
              onClick={handleGhostCreate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2"
            >
              Continue <FiChevronRight />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScanPay;
