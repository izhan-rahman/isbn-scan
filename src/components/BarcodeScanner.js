import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const [loading, setLoading] = useState(true);

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
        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            const isbn = decodedText.replace(/[^0-9X]/gi, "");
            if (isbn.startsWith("978") || isbn.startsWith("979")) {
              scanner
                .stop()
                .then(() => {
                  isScanning.current = false;
                  onDetected(isbn);
                })
                .catch((err) =>
                  console.warn("Error stopping after scan:", err)
                );
            }
          },
          (error) => {
            // Optional scan error handler
            console.log("Scan error:", error);
          }
        );
        isScanning.current = true;
        setLoading(false);
      } catch (err) {
        console.error("Error starting scanner:", err);
        setLoading(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current
          .stop()
          .then(() => {
            isScanning.current = false;
          })
          .catch((err) => {
            console.warn("Error stopping scanner on unmount:", err);
          });
      }
    };
  }, [onDetected]);

  return (
    <div>
      {loading && (
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="spinner" />
          <p>Initializing camera...</p>
        </div>
      )}
      <div id="reader" style={{ width: "100%", borderRadius: "10px" }} />
      {!loading && <p>📷 Scanning for ISBN...</p>}
    </div>
  );
}
