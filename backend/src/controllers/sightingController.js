const prisma = require("../lib/prisma");
const { identifyBird } = require("../services/aiService");

// CREATE SIGHTING
exports.createSighting = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = req.file.path;

    const aiResult = await identifyBird(imagePath);

    const imageUrl = `/uploads/${req.file.filename}`;

    const sighting = await prisma.sighting.create({
      data: {
        species: aiResult.species,
        imageUrl,
        userId: parseInt(userId),
      },
    });

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { xp: { increment: 10 } },
    });

    return res.json({
      id: sighting.id,
      species: sighting.species,
      imageUrl: sighting.imageUrl,
      confidence: aiResult.confidence,
      userId: sighting.userId,
      timestamp: sighting.timestamp,
    });

  } catch (err) {
    console.log("CREATE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


// GET WINGDEX (THIS IS YOUR FUNCTION)
exports.getSightings = async (req, res) => {
  try {
    const { userId } = req.query;

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
      }))
    );

  } catch (err) {
    console.log("GET ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};