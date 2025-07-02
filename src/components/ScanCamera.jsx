import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const ScanCamera = ({ onScan }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      (result) => {
        scanner.clear();
        onScan(result);
      },
      (err) => {
        // console.log("Scan error", err);
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="reader" className="w-full" />;
};

export default ScanCamera;
