const prisma = require("../lib/prisma");

exports.createSighting = async (req, res) => {
  try {
    const { species, userId } = req.body;

    // DEBUG (keep for now)
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    // SAFETY CHECK
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
      });
    }

    // CREATE IMAGE URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // SAVE SIGHTING
    const sighting = await prisma.sighting.create({
      data: {
        species: species || "Unknown",
        imageUrl,
        userId: parseInt(userId),
      },
    });

    // ADD XP
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { xp: { increment: 10 } },
    });

    return res.json(sighting);

  } catch (err) {
    console.log("CREATE SIGHTING ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};