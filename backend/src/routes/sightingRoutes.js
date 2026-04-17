const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const {
  createSighting,
  getSightings,
  analyzeImage,
  deleteSighting,
} = require("../controllers/sightingController");

// ANALYZE IMAGE (Uploads and gets AI classification, but no DB save)
router.post("/analyze", auth, upload.single("image"), analyzeImage);

// CREATE SIGHTING (Officially save to DB)
router.post("/", auth, createSighting);

// GET WINGDEX
router.get("/", auth, getSightings);

// DELETE SIGHTING
router.delete("/:id", auth, deleteSighting);

module.exports = router;