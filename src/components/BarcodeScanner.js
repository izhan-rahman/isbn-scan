import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const config = {
      fps: 10,
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
          { deviceId: { exact: backCamera.id } },
          config,
          (decodedText) => {
            const isbn = decodedText.replace(/[^0-9X]/gi, "");
            if (isbn.startsWith("978") || isbn.startsWith("979")) {
              scanner.stop();
              isScanning.current = false;
              onDetected(isbn);
            }
          },
          (error) => {
            console.warn("Scanning error:", error);
          }
        );
        isScanning.current = true;
        setIsLoading(false);
      } catch (err) {
        console.error("Camera init error:", err);
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(() => setIsLoading(false), 5000); // fallback
    startScanner();

    return () => {
      clearTimeout(timeout);
      if (isScanning.current && scanner) {
        scanner.stop().catch((err) =>
          console.warn("Scanner cleanup error:", err)
        );
      }
    };
  }, [onDetected]);

  return (
    <div>
      {isLoading && <p>📷 Initializing camera...</p>}
      <div
        id="reader"
        style={{
          width: "100%",
          borderRadius: "10px",
          display: isLoading ? "none" : "block",
        }}
      />
    </div>
  );
}
