const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));

// Fallback route to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Port from Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
