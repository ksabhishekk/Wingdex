const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./routes/authRoutes");
const sightingRoutes = require("./routes/sightingRoutes");

app.use("/auth", authRoutes);
app.use("/sightings", sightingRoutes);

// test route
app.get("/", (req, res) => {
  res.send("WingDex API running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});