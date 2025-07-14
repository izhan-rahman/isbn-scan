import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const [isLoading, setIsLoading] = useState(true); // 👈 New loading state

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
            const isbn = decodedText.replace(/[^0-9X]/gi, "");
            if (isbn.startsWith("978") || isbn.startsWith("979")) {
              scanner.stop().then(() => {
                isScanning.current = false;
                onDetected(isbn);
              });
            }
          },
          (error) => {
            // Ignore scan errors
          }
        );

        isScanning.current = true;
        setIsLoading(false); // ✅ Done loading
      } catch (err) {
        console.error("Error starting scanner:", err);
        setIsLoading(false);
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
      {isLoading && (
        <div style={styles.loaderBox}>
          <div style={styles.spinner} />
          <p>🎦 Initializing camera...</p>
        </div>
      )}
      <div id="reader" style={{ width: "100%", borderRadius: "10px", display: isLoading ? "none" : "block" }}></div>
    </div>
  );
}

const styles = {
  loaderBox: {
    textAlign: "center",
    padding: "20px",
    color: "#555",
  },
  spinner: {
    margin: "0 auto 12px",
    width: "40px",
    height: "40px",
    border: "4px solid #ccc",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Add this to your index.css or global CSS file
/*

*/
