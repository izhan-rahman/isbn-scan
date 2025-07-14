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
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          console.error("No cameras found.");
          return;
        }

        const backCamera =
          cameras.find((cam) => cam.label.toLowerCase().includes("back")) || cameras[0];

        await scanner.start(
          { deviceId: { exact: backCamera.id } },
          config,
          (decodedText) => {
            const isbn = decodedText.replace(/[^0-9X]/gi, ""); // Clean ISBN
            if (isbn.startsWith("978") || isbn.startsWith("979")) {
              scanner.stop().then(() => {
                isScanning.current = false;
                onDetected(isbn);
              });
            }
          },
          (error) => {
            // Optional: log errors silently
          }
        );

        isScanning.current = true;
      } catch (err) {
        console.error("Error starting scanner:", err);
      }
    };

    startScanner();

    return () => {
      if (isScanning.current) {
        scanner.stop().catch((err) => {
          console.warn("Error stopping scanner:", err);
        });
      }
    };
  }, [onDetected]);

  return (
    <div>
      <div id="reader" style={{ width: "100%", borderRadius: "10px" }}></div>
      <p>📷 Scanning for ISBN...</p>
    </div>
  );
}
