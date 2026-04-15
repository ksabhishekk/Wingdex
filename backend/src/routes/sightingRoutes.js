const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { createSighting } = require("../controllers/sightingController");

router.post("/", upload.single("image"), createSighting);

module.exports = router;