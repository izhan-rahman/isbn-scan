// BarcodeScanner.js
import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const isScanning = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const config = {
      fps: 15,
      qrbox: { width: 250, height: 250 },
      disableFlip: true,
    };

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes("back")
        ) || devices[0];

        await scanner.start(
          backCamera.id,
          config,
          (decodedText) => {
            const isbn = decodedText.replace(/[^0-9X]/gi, "");
            if (isbn.startsWith("978") || isbn.startsWith("979")) {
              if (!isScanning.current) {
                isScanning.current = true;
                scanner.stop().then(() => onDetected(isbn));
              }
            }
          },
          (errorMessage) => {
            // Silent scan errors
          }
        );
      } catch (err) {
        console.error("Scanner start error:", err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current.stop().catch((err) =>
          console.warn("Stop scanner error:", err)
        );
      }
    };
  }, [onDetected]);

  return (
    <div>
      <div id="reader" style={{ width: "100%", borderRadius: "10px" }} />
      <p>📷 Scanning for ISBN...</p>
    </div>
  );
}
