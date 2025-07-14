
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then((devices) => {
        const backCamera =
          devices.find((d) => d.label.toLowerCase().includes("back")) || devices[0];

        if (!backCamera) {
          throw new Error("No camera found");
        }

        scanner
          .start(
            backCamera.id,
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              const isbn = decodedText.replace(/[^0-9X]/gi, "");
              if (isbn.startsWith("978") || isbn.startsWith("979")) {
                scanner.stop().then(() => {
                  isScanning.current = false;
                  onDetected(isbn);
                });
              }
            },
            (err) => {
             
            }
          )
          .then(() => {
            isScanning.current = true;
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setLoading(false);
      });

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onDetected]);

  return (
    <div>
      {loading && <p style={{ color: "#007bff" }}>Starting Scanner...</p>}
      <div id="reader" style={{ width: "100%", borderRadius: "10px" }} />
    </div>
  );
}
