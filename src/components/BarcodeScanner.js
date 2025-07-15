import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onDetected }) => {
  const qrCodeRegionId = "scanner";
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isScannerRunningRef = useRef(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (isScannerRunningRef.current) {
            isScannerRunningRef.current = false;
            html5QrCode
              .stop()
              .then(() => {
                html5QrCode.clear();
                onDetected(decodedText);
              })
              .catch((err) => console.error("Error stopping scanner", err));
          }
        },
        (errorMessage) => {
          // Ignore scan errors
        }
      )
      .then(() => {
        isScannerRunningRef.current = true;
      })
      .catch((err) => console.error("Camera start error", err));

    return () => {
      if (isScannerRunningRef.current) {
        html5QrCode
          .stop()
          .then(() => html5QrCode.clear())
          .catch((err) => console.error("Cleanup error", err));
      }
    };
  }, []);

  return (
    <div ref={scannerRef} id={qrCodeRegionId} style={{ width: "100%" }} />
  );
};

export default BarcodeScanner;
