const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// -------------------------
// MIDDLEWARE
// -------------------------
app.use(cors());
app.use(express.json());

// IMPORTANT: serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// ROUTES
// -------------------------
const authRoutes = require("./routes/authRoutes");
const sightingRoutes = require("./routes/sightingRoutes");

app.use("/auth", authRoutes);
app.use("/sightings", sightingRoutes);

// -------------------------
// TEST ROUTE
// -------------------------
app.get("/", (req, res) => {
  res.send("WingDex API running 🚀");
});

// -------------------------
// START SERVER (IMPORTANT FIX)
// -------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});