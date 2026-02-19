const express = require("express");
const path = require("path");

const app = express();

// Use Render port if available, otherwise 3000
const PORT = process.env.PORT || 3000;

// Important for Render (behind proxy)
app.set("trust proxy", true);

app.use(express.json());
app.use(express.static("public"));

const urlDatabase = {}; // In-memory storage

// Generate random short code
function generateCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Create short URL
app.post("/shorten", (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  const shortCode = generateCode();
  urlDatabase[shortCode] = originalUrl;

  // Dynamic base URL (works locally & in production)
  const baseUrl = req.protocol + "://" + req.get("host");

  res.json({
    shortUrl: `${baseUrl}/${shortCode}`
  });
});

// Redirect
app.get("/:code", (req, res) => {
  const originalUrl = urlDatabase[req.params.code];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send("URL not found");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
