// components/BarcodeScanner.js
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const backCamera =
          devices.find((d) => d.label.toLowerCase().includes("back")) ||
          devices[0];

        html5QrCode
          .start(
            backCamera.id,
            {
              fps: 10,
              qrbox: 250,
            },
            (decodedText) => {
              html5QrCode.stop().then(() => {
                onDetected(decodedText);
              });
            },
            () => {} // ignore scan errors
          )
          .then(() => setLoading(false))
          .catch((err) => {
            console.error("Camera start error:", err);
            setLoading(false);
          });

        scannerRef.current = html5QrCode;
      } else {
        alert("No camera found.");
        setLoading(false);
      }
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onDetected]);

  return (
    <div style={{ width: "100%" }}>
      {loading && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔄</span>{" "}
          Initializing camera...
        </div>
      )}
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
}
