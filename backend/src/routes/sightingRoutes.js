const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createSighting,
  getSightings,
} = require("../controllers/sightingController");

// CREATE
router.post("/", upload.single("image"), createSighting);

// GET WINGDEX
router.get("/", getSightings);

module.exports = router;