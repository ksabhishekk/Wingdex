const prisma = require("../lib/prisma");

exports.createSighting = async (req, res) => {
  const { species, userId } = req.body;

  const imageUrl = req.file.path;

  const sighting = await prisma.sighting.create({
    data: {
      species,
      imageUrl,
      userId: parseInt(userId),
    },
  });

  // add XP
  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { xp: { increment: 10 } },
  });

  res.json(sighting);
};