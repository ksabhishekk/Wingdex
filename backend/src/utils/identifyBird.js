const axios = require("axios");
const fs = require("fs");

const HF_API =
  "https://api-inference.huggingface.co/models/Bingsu/bird-classifier";

const HF_TOKEN = process.env.HF_TOKEN;

async function identifyBird(imagePath) {
  try {
    const image = fs.readFileSync(imagePath);

    const res = await axios.post(HF_API, image, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
    });

    const top = res.data?.[0];

    return top?.label || "Unknown Bird";
  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    return "Unknown Bird";
  }
}

module.exports = identifyBird;