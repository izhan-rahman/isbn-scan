import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    let isStopped = false;

    Html5Qrcode.getCameras()
      .then((devices) => {
        const backCamera =
          devices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || devices[0];

        return scanner.start(
          { deviceId: { exact: backCamera.id } },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            const isbn = decodedText.replace(/[^0-9X]/gi, '');
            if ((isbn.startsWith("978") || isbn.startsWith("979")) && !isStopped) {
              isStopped = true;
              onDetected(isbn); // Trigger state update first
              scanner.stop().catch((err) => {
                console.error("Error stopping scanner:", err);
              });
            }
          },
          (error) => {
            // silent scan errors
          }
        );
      })
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Camera error:", err);
        setLoading(false);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onDetected]);

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {loading && (
        <p style={{ color: "#666", marginBottom: "12px" }}>
          ⏳ Initializing camera...
        </p>
      )}
      <div id="reader" style={{ width: "100%", borderRadius: "10px" }}></div>
    </div>
  );
}
