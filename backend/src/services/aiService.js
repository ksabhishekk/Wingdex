const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const INAT_TOKEN = process.env.INAT_TOKEN;

// ─── BIRD IDENTIFICATION VIA iNATURALIST CV API ───────────────────────────────
// iNaturalist is a citizen science platform with millions of wildlife observations.
// Their CV model covers thousands of species including Indian birds.
// Free account + JWT token from: https://www.inaturalist.org/users/api_token
async function identifyBird(imagePath) {
  if (!INAT_TOKEN || INAT_TOKEN === '' || INAT_TOKEN === 'missing') {
    return {
      species: 'NOT_A_BIRD',
      confidence: 0,
      reason: 'INAT_TOKEN not set. Get a free JWT token at inaturalist.org/users/api_token and add it to backend/.env',
    };
  }

  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const res = await axios.post(
      'https://api.inaturalist.org/v1/computervision/score_image',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${INAT_TOKEN}`,
        },
        timeout: 20000,
      }
    );

    const results = res.data.results;
    if (!results || results.length === 0) {
      return { species: 'NOT_A_BIRD', confidence: 0 };
    }

    const top = results[0];
    const taxon = top.taxon;

    console.log(
      `[iNaturalist] "${taxon?.preferred_common_name || taxon?.name}" | class: ${taxon?.iconic_taxon_name} | score: ${(top.combined_score * 100).toFixed(1)}%`
    );

    // iconic_taxon_name === 'Aves' means it's a bird
    if (!taxon || taxon.iconic_taxon_name !== 'Aves') {
      console.log(`[iNaturalist] Not a bird — iconic taxon: ${taxon?.iconic_taxon_name}`);
      return { species: 'NOT_A_BIRD', confidence: 0 };
    }

    const species = taxon.preferred_common_name
      ? capitalizeWords(taxon.preferred_common_name)
      : taxon.name;

    const confidence = Math.min(Math.round((top.combined_score || 0) * 100), 99);

    return { species, confidence };

  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error || err.message;
    console.error(`[iNaturalist] API ERROR (${status}):`, msg);

    if (status === 401) {
      return {
        species: 'NOT_A_BIRD',
        confidence: 0,
        reason: 'iNaturalist token expired or invalid. Go to inaturalist.org/users/api_token to get a fresh token.',
      };
    }

    return { species: 'NOT_A_BIRD', confidence: 0, reason: `Vision API error (${status}): ${msg}` };
  }
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// ─── WEB SCRAPING: WIKIPEDIA ──────────────────────────────────────────────────
async function scrapeBirdInfo(species) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(species)}&format=json&redirects=1`;
    const res = await axios.get(url, { timeout: 8000 });
    const pages = res.data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === '-1') {
      console.log(`[Wikipedia] No page for "${species}", using fallback.`);
      return fallbackBio(species);
    }

    const rawText = (pages[pageId].extract || '').replace(/\s+/g, ' ').trim();
    if (!rawText || rawText.length < 20) return fallbackBio(species);

    const searchText = rawText.substring(0, 2000).toLowerCase();
    const lore = rawText.substring(0, 350).trim() + '...';

    let diet = 'OMNIVORE';
    if (searchText.includes('granivore') || searchText.includes('granivorous') || (searchText.includes('seeds') && searchText.includes('grain'))) diet = 'GRANIVORE';
    else if (searchText.includes('seeds') || searchText.includes('grain')) diet = 'GRANIVORE';
    else if (searchText.includes('insectivore') || searchText.includes('insectivorous') || searchText.includes('insects') || searchText.includes('invertebrates')) diet = 'INSECTIVORE';
    else if (searchText.includes('carnivore') || searchText.includes('carnivorous') || searchText.includes('small mammals') || searchText.includes('rodents')) diet = 'CARNIVORE';
    else if (searchText.includes('piscivore') || searchText.includes('piscivorous') || searchText.includes('fish')) diet = 'PISCIVORE';
    else if (searchText.includes('frugivore') || searchText.includes('frugivorous') || searchText.includes('fruit') || searchText.includes('nectar')) diet = 'FRUGIVORE';

    let flight = 'AGILE';
    if (searchText.includes('soaring') || searchText.includes('gliding')) flight = 'SOARING';
    else if (searchText.includes('hovering') || searchText.includes('hover')) flight = 'HOVERING';
    else if (searchText.includes('swift') || searchText.includes('fast flier') || searchText.includes('rapid flight')) flight = 'SWIFT';
    else if (searchText.includes('flightless') || searchText.includes('cannot fly')) flight = 'FLIGHTLESS';

    let habitat = 'FOREST';
    if (searchText.includes('urban') || searchText.includes('suburban') || searchText.includes('cities') || searchText.includes('towns')) habitat = 'URBAN';
    else if (searchText.includes('wetland') || searchText.includes('marsh') || searchText.includes('swamp') || searchText.includes('mangrove')) habitat = 'WETLAND';
    else if (searchText.includes('coastal') || searchText.includes('seashore') || searchText.includes('ocean') || searchText.includes('marine')) habitat = 'COASTAL';
    else if (searchText.includes('desert') || searchText.includes('arid') || searchText.includes('savanna')) habitat = 'DESERT';
    else if (searchText.includes('grassland') || searchText.includes('meadow') || searchText.includes('prairie')) habitat = 'GRASSLAND';
    else if (searchText.includes('mountain') || searchText.includes('alpine') || searchText.includes('highland')) habitat = 'HIGHLAND';
    else if (searchText.includes('tropical') || searchText.includes('rainforest') || searchText.includes('jungle')) habitat = 'TROPICAL';

    console.log(`[Wikipedia] "${species}" → diet=${diet}, flight=${flight}, habitat=${habitat}`);
    return { lore, diet, flight, habitat };

  } catch (err) {
    console.error('[Wikipedia] SCRAPE ERROR:', err.message);
    return fallbackBio(species);
  }
}

function fallbackBio(species) {
  return {
    lore: `The ${species} is a remarkable avian species known for its distinct features and behavior patterns within its native ecosystem. It has been observed across various habitats and is recognized by birdwatchers worldwide.`,
    diet: 'OMNIVORE',
    flight: 'AGILE',
    habitat: 'FOREST',
  };
}

module.exports = { identifyBird, scrapeBirdInfo };