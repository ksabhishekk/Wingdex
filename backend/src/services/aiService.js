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

async function scrapeBirdInfo(species) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=${encodeURIComponent(species)}&format=json`;
    const res = await axios.get(url);
    const pages = res.data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === "-1") {
      return fallbackBio(species);
    }
    
    // Clean HTML tags and newlines
    let lore = pages[pageId].extract.replace(/<\/?[^>]+(>|$)/g, "").replace(/\n/g, " ");
    if (!lore || lore.length < 10) {
      return fallbackBio(species);
    }

    lore = lore.substring(0, 300).trim() + "...";

    const textLower = lore.toLowerCase();
    
    let diet = "OMNIVORE";
    if (textLower.includes("seeds") || textLower.includes("grain")) diet = "GRANIVORE";
    else if (textLower.includes("insects") || textLower.includes("bugs")) diet = "INSECTIVORE";
    else if (textLower.includes("meat") || textLower.includes("prey") || textLower.includes("carnivore")) diet = "CARNIVORE";
    else if (textLower.includes("fish")) diet = "PISCIVORE";
    else if (textLower.includes("fruit") || textLower.includes("nectar")) diet = "FRUGIVORE";

    let flight = "AGILE";
    if (textLower.includes("soaring") || textLower.includes("glide")) flight = "SOARING";
    else if (textLower.includes("hover")) flight = "HOVERING";
    else if (textLower.includes("fast") || textLower.includes("swift")) flight = "SWIFT";
    else if (textLower.includes("flightless")) flight = "FLIGHTLESS";

    let habitat = "FOREST";
    if (textLower.includes("urban") || textLower.includes("city")) habitat = "URBAN";
    else if (textLower.includes("wetland") || textLower.includes("marsh") || textLower.includes("water") || textLower.includes("lake")) habitat = "WETLAND";
    else if (textLower.includes("coast") || textLower.includes("sea") || textLower.includes("ocean")) habitat = "COASTAL";
    else if (textLower.includes("desert") || textLower.includes("arid")) habitat = "DESERT";

    return { lore, diet, flight, habitat };
  } catch (err) {
    console.log("WIKI SCRAPE ERROR:", err.message);
    return fallbackBio(species);
  }
}

function fallbackBio(species) {
  return {
    lore: `The ${species} is a remarkable avian species known for its distinct features and behavior in its natural environment.`,
    diet: "OMNIVORE",
    flight: "AGILE",
    habitat: "FOREST"
  };
}

module.exports = { identifyBird, scrapeBirdInfo };