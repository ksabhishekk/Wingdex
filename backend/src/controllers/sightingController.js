const prisma = require("../lib/prisma");
const { identifyBird, scrapeBirdInfo } = require("../services/aiService");
const axios = require("axios");

// ANALYZE IMAGE (Upload file & run AI without saving to WingDex)
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = req.file.path;
    const aiResult = await identifyBird(imagePath);
    const imageUrl = `/uploads/${req.file.filename}`;

    // ── NOT A BIRD CHECK ──────────────────────────────────────────────────────
    if (aiResult.species === "NOT_A_BIRD") {
      return res.status(422).json({
        error: "NOT_A_BIRD",
        message: aiResult.reason || "No bird detected. Please photograph a bird and try again.",
      });
    }

    // Scrape Wikipedia for bio data
    const bio = await scrapeBirdInfo(aiResult.species);

    return res.json({
      species: aiResult.species,
      imageUrl,
      confidence: aiResult.confidence,
      lore: bio.lore,
      diet: bio.diet,
      flight: bio.flight,
      habitat: bio.habitat,
      rarity: bio.rarity,
    });
  } catch (err) {
    console.log("ANALYZE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


// CREATE SIGHTING (Save confirmed sighting to DB)
exports.createSighting = async (req, res) => {
  try {
    const userId = req.userId;
    const { species, imageUrl, confidence, lore, diet, flight, habitat, rarity, latitude, longitude } = req.body;

    if (!species || !imageUrl) {
      return res.status(400).json({ error: "Missing sighting metadata" });
    }

    const sighting = await prisma.sighting.create({
      data: {
        species,
        imageUrl,
        confidence: parseFloat(confidence) || 0,
        lore,
        diet,
        flight,
        habitat,
        rarity: rarity || 'common',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        userId: parseInt(userId),
      },
    });

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { xp: { increment: 10 } },
    });

    return res.json(sighting);

  } catch (err) {
    console.log("CREATE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


// GET WINGDEX (THIS IS YOUR FUNCTION)
exports.getSightings = async (req, res) => {
  try {
    const userId = req.userId;

    const sightings = await prisma.sighting.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { timestamp: "desc" },
    });

    return res.json(
      sightings.map((s) => ({
        id: s.id,
        species: s.species,
        imageUrl: s.imageUrl,
        timestamp: s.timestamp,
        confidence: s.confidence,
        lore: s.lore,
        diet: s.diet,
        flight: s.flight,
        habitat: s.habitat,
        rarity: s.rarity || 'common',
        latitude: s.latitude,
        longitude: s.longitude,
      }))
    );

  } catch (err) {
    console.log("GET ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE SIGHTING
exports.deleteSighting = async (req, res) => {
  try {
    const userId = req.userId;
    const sightingId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.sighting.findUnique({
      where: { id: sightingId }
    });

    if (!existing || existing.userId !== parseInt(userId)) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    await prisma.sighting.delete({
      where: { id: sightingId }
    });

    return res.json({ success: true });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET HEATMAP DATA
exports.getHeatmapData = async (req, res) => {
  try {
    const { species, month } = req.query;
    if (!species || !month) {
      return res.status(400).json({ error: "Missing species or month" });
    }

    const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(species)}&month=${month}&per_page=50&has[]=geo&quality_grade=research`;
    const inatRes = await axios.get(url, { headers: { 'User-Agent': 'WingdexApp/1.0' }, timeout: 8000 });
    
    if (!inatRes.data || !inatRes.data.results) {
      return res.json([]);
    }

    const points = inatRes.data.results.map(obs => {
      if (!obs.location) return null;
      const [lat, lng] = obs.location.split(',');
      return { 
        latitude: parseFloat(lat), 
        longitude: parseFloat(lng),
        id: obs.id
      };
    }).filter(Boolean);

    return res.json(points);

  } catch (err) {
    console.log("HEATMAP ERROR:", err.message);
    // If it's a 404 or something, just return empty array
    return res.json([]);
  }
};