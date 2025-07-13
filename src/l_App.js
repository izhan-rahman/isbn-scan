import { useState } from "react";
import Tesseract from "tesseract.js";

export default function App() {
  const [view, setView] = useState("scan");
  const [photo, setPhoto] = useState(null);
  const [isbn, setIsbn] = useState("");
  const [manualIsbn, setManualIsbn] = useState("");
  const [titleFromBackend, setTitleFromBackend] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showManualTitle, setShowManualTitle] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleScanClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPhoto(url);
        setView("saving");
        setLoadingText("Extracting text...");

        const result = await Tesseract.recognize(url, "eng", {
          logger: (m) => console.log(m),
        });

        const text = result.data.text;
        setLoadingText("Detecting ISBN...");

        const match = text.match(/97[89][-– ]?\d{1,5}[-– ]?\d{1,7}[-– ]?\d{1,7}[-– ]?\d/);
        if (match) {
          const detectedIsbn = match[0].replace(/[-–\s]/g, "");
          setIsbn(detectedIsbn);
          fetchTitle(detectedIsbn);
        } else {
          setView("manualIsbn");
        }
      }
    };
    input.click();
  };

  const fetchTitle = async (isbnToUse) => {
    try {
      const response = await fetch("https://testocrtest.pythonanywhere.com/receive_isbn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn: isbnToUse }),
      });

      const data = await response.json();
      setIsbn(isbnToUse);

      if (data.title) {
        setTitleFromBackend(data.title);
        setManualTitle("");
        setShowManualTitle(false);
      } else {
        setTitleFromBackend("");
        setShowManualTitle(true);
      }

      setView("priceEntry");
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setTitleFromBackend("");
      setShowManualTitle(true);
      setView("priceEntry");
    }
  };

  const handleManualIsbnFetch = () => {
    const trimmedIsbn = manualIsbn.trim();
    if (trimmedIsbn) {
      fetchTitle(trimmedIsbn);
    }
  };

  const sendToBackend = async () => {
    const title = titleFromBackend || manualTitle;
    if (!isbn || !title || !price || !quantity) {
      return;
    }

    try {
      const response = await fetch("https://testocrtest.pythonanywhere.com/save_title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isbn,
          b_title: title,
          price,
          quantity,
        }),
      });

      const data = await response.json();
      setIsSaved(true);
      setSaveMessage("✅ Saved successfully");
      console.log("✅ Saved:", data);
    } catch (error) {
      console.error("❌ Save error:", error);
    }
  };

  const handleBack = () => {
    setView("scan");
    setPhoto(null);
    setIsbn("");
    setManualIsbn("");
    setTitleFromBackend("");
    setManualTitle("");
    setPrice("");
    setQuantity("");
    setShowManualTitle(false);
    setIsSaved(false);
    setSaveMessage("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {view === "scan" && (
          <>
            <h1 style={styles.header}>📚 ISBN Scanner</h1>
            <p style={styles.subText}>Scan a book's ISBN from a photo</p>
            <button style={styles.primaryButton} onClick={handleScanClick}>
              📷 Take Photo
            </button>
          </>
        )}

        {view === "saving" && (
          <>
            <div style={styles.spinner}></div>
            <h3>Processing...</h3>
            <p>{loadingText}</p>
          </>
        )}

        {view === "manualIsbn" && (
          <>
            <h3 style={{ color: "red" }}>❗ ISBN not found</h3>
            <p>Enter ISBN manually:</p>
            <input
              value={manualIsbn}
              onChange={(e) => setManualIsbn(e.target.value)}
              placeholder="Enter ISBN"
              style={styles.input}
            />
            <button style={styles.primaryButton} onClick={handleManualIsbnFetch}>
              🔍 Fetch Title
            </button>
          </>
        )}

        {view === "priceEntry" && (
          <>
            {photo && <img src={photo} alt="Book" style={styles.image} />}
            <p><strong>ISBN:</strong> {isbn}</p>
            {titleFromBackend && (
              <p><strong>Title:</strong> {titleFromBackend}</p>
            )}

            {showManualTitle && (
              <>
                <p>Enter Book Title:</p>
                <input
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Enter title"
                  style={styles.input}
                />
              </>
            )}

            <p>Enter Price:</p>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              style={styles.input}
            />

            <p>Enter Quantity:</p>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              style={styles.input}
            />

            {!isSaved && (
              <button style={styles.saveButton} onClick={sendToBackend}>
                💾 Save
              </button>
            )}

            {saveMessage && <p style={{ marginTop: 12, color: "green" }}>{saveMessage}</p>}

            <button style={styles.secondaryButton} onClick={handleBack}>
              🔙 Return to Scanner
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #e0f7fa, #fefefe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  header: {
    fontSize: "26px",
    color: "#007bff",
  },
  subText: {
    color: "#666",
    marginBottom: "20px",
  },
  image: {
    width: "180px",
    borderRadius: "16px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    width: "90%",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "12px",
  },
  primaryButton: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 28px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  saveButton: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 20px",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "20px",
  },
  spinner: {
    margin: "20px auto",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
};
