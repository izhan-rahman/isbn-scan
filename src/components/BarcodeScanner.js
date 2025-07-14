// src/components/BarcodeScanner.js
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes("back")
        ) || devices[0];

        if (!backCamera) throw new Error("No camera found");

        await scanner.start(
          backCamera.id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            const isbn = decodedText.replace(/[^0-9X]/gi, "");
            if (isbn.startsWith("978") || isbn.startsWith("979")) {
              scanner.stop().then(() => onDetected(isbn));
            }
          },
          () => {}
        );

        setLoading(false);
      } catch (err) {
        console.error("Scanner error:", err);
        setLoading(false);
      }
    };

    startScanner();

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div>
      <div id="reader" style={{ width: "100%", borderRadius: "10px" }} />
      {loading && <p>📷 Initializing camera...</p>}
    </div>
  );
}
