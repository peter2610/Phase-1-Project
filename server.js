const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Catch-all route for SPA (Single Page Application) support
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Define the port (Render uses PORT env variable)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
