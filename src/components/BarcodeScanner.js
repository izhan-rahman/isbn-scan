import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const isScannerRunningRef = useRef(false);
  const qrCodeRegionId = "qr-scanner";

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id;

          // Only start if not already running
          if (!isScannerRunningRef.current) {
            html5QrCode
              .start(
                cameraId,
                config,
                (decodedText) => {
                  if (decodedText) {
                    onDetected(decodedText);
                    // Stop after one successful scan
                    html5QrCode
                      .stop()
                      .then(() => {
                        html5QrCode.clear();
                        isScannerRunningRef.current = false;
                      })
                      .catch((err) => console.error("Error stopping scanner", err));
                  }
                },
                (errorMessage) => {
                  // ignore scan errors
                }
              )
              .then(() => {
                isScannerRunningRef.current = true;
              })
              .catch((err) => console.error("Camera start error", err));
          }
        } else {
          console.error("No cameras found.");
        }
      })
      .catch((err) => {
        console.error("Camera access error", err);
      });

    // Cleanup
    return () => {
      if (html5QrCode && isScannerRunningRef.current) {
        html5QrCode
          .stop()
          .then(() => {
            html5QrCode.clear();
            isScannerRunningRef.current = false;
          })
          .catch((err) => console.error("Cleanup error", err));
      }
    };
  }, []);

  return (
    <div ref={scannerRef} id={qrCodeRegionId} style={{ width: "100%" }} />
  );
};

export default BarcodeScanner;
