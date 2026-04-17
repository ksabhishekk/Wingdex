const axios = require("axios");
const fs = require("fs");

const HF_API =
  "https://api-inference.huggingface.co/models/google/vit-base-patch16-224";

const HF_TOKEN = process.env.HF_TOKEN;

async function identifyBird(imagePath) {
  try {
    // If no token is provided, mock the result
    if (!HF_TOKEN || HF_TOKEN === "missing" || HF_TOKEN === "") {
      console.log("No HF_TOKEN found. Returning mocked AI result.");
      return { species: "Eastern Bluebird (Mock)", confidence: 92.5 };
    }

    const image = fs.readFileSync(imagePath);

    const res = await axios.post(HF_API, image, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
    });

    const predictions = res.data;

    if (!predictions || predictions.length === 0) {
      return { species: "Unknown", confidence: 0 };
    }

    const top = predictions[0];

    return {
      species: top.label,
      confidence: top.score * 100,
    };
  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);

    return {
      species: "Unknown",
      confidence: 0,
    };
  }
}

module.exports = { identifyBird };