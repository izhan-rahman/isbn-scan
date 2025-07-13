import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null); // We'll store the scanner instance here
  const isScanning = useRef(false); // Track scanning state

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const config = {
      fps: 10, // Scanning speed (frames per second)
      qrbox: { width: 250, height: 250 }, // Scanner box size
      disableFlip: true, // Disable auto flip
    };

    // Start scanning
    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" }, // Use rear camera
          config,
          (decodedText) => {
            // Handle decoded ISBN text
            const isbn = decodedText.replace(/[^0-9X]/gi, ''); // Clean ISBN
            if (isbn.startsWith("978") || isbn.startsWith("979")) {
              scanner.stop(); // Stop scanning once ISBN is detected
              isScanning.current = false; // Update scanning state
              onDetected(isbn); // Pass ISBN to the parent component
            }
          },
          (error) => {
            // Handle errors (optional)
            console.error("Scanner error:", error);
          }
        );
        isScanning.current = true; // Update scanning state
      } catch (err) {
        console.error("Error starting scanner:", err);
      }
    };

    startScanner();

    // Cleanup the scanner when component unmounts
    return () => {
      if (isScanning.current) {
        try {
          scanner.stop(); // Only stop if the scanner was started
        } catch (err) {
          console.warn("Error stopping the scanner:", err);
        }
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
