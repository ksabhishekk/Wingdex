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

    // Keep the decimal precision up to 1 decimal place, max out at 99.9%
    const rawScore = (top.combined_score || 0) * 100;
    const confidence = Math.min(Math.round(rawScore * 10) / 10, 99.9);

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

    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.message.includes('Network Error') || err.message.includes('getaddrinfo')) {
      return { species: 'OFFLINE', confidence: 0, reason: `No internet connection on server: ${msg}` };
    }

    return { species: 'NOT_A_BIRD', confidence: 0, reason: `Vision API error (${status}): ${msg}` };
  }
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Wikipedia requires a User-Agent header
const WIKI_HEADERS = {
  'User-Agent': 'Wingdex/1.0 (bird-identification-app; educational-project)',
  'Accept': 'application/json',
};

// Step 1: Wikipedia REST summary API — handles redirects & casing automatically
async function fetchWikipediaSummary(title) {
  try {
    const slug = title.trim().replace(/ /g, '_');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`;
    console.log(`[Wikipedia] REST lookup: ${url}`);
    const res = await axios.get(url, { headers: WIKI_HEADERS, timeout: 8000 });
    const text = (res.data.extract || '').replace(/\s+/g, ' ').trim();
    console.log(`[Wikipedia] REST result for "${title}": ${text.substring(0, 80)}...`);
    return text.length >= 20 ? text : null;
  } catch (err) {
    if (err.response?.status === 404) return null; // article doesn't exist
    console.error(`[Wikipedia] REST error for "${title}":`, err.message);
    return null;
  }
}

// Fetch categories to get precise IUCN Red List status
async function fetchWikipediaCategories(title) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodeURIComponent(title)}&redirects=1&cllimit=500&format=json`;
    const res = await axios.get(url, { headers: WIKI_HEADERS, timeout: 8000 });
    const pages = res.data?.query?.pages;
    const categories = [];
    if (pages) {
      for (const pageId in pages) {
        if (pages[pageId].categories) {
          pages[pageId].categories.forEach(c => categories.push(c.title.toLowerCase()));
        }
      }
    }
    return categories;
  } catch (err) {
    console.error(`[Wikipedia] Categories error for "${title}":`, err.message);
    return [];
  }
}

// Step 2: MediaWiki search API — finds best matching article title, then fetches it
async function searchWikipediaExtract(query) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' bird')}&srlimit=1&format=json`;
    console.log(`[Wikipedia] Searching for: "${query} bird"`);
    const searchRes = await axios.get(searchUrl, { headers: WIKI_HEADERS, timeout: 8000 });
    const hits = searchRes.data?.query?.search;
    if (!hits || hits.length === 0) {
      console.log(`[Wikipedia] No search results for "${query}"`);
      return null;
    }
    const bestTitle = hits[0].title;
    console.log(`[Wikipedia] Search found article: "${bestTitle}"`);
    return await fetchWikipediaSummary(bestTitle);
  } catch (err) {
    console.error(`[Wikipedia] Search error:`, err.message);
    return null;
  }
}


async function scrapeBirdInfo(species) {
  try {
    // Try REST summary API first (most reliable), then full-text search fallback
    let rawText = await fetchWikipediaSummary(species);
    let categories = [];
    
    if (!rawText) {
      rawText = await searchWikipediaExtract(species);
      if (rawText) categories = await fetchWikipediaCategories(species);
    } else {
      categories = await fetchWikipediaCategories(species);
    }


    if (!rawText) {
      console.log(`[Wikipedia] No article found for "${species}", using generic fallback.`);
      return fallbackBio(species);
    }

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

    // ── RARITY DETECTION ───────────────────────────────────────────────────────
    // Priority 1: IUCN Red List Category
    let rarity = null;
    if (categories.some(c => c.includes('extinct') || c.includes('critically endangered') || c.includes('endangered') || c.includes('vulnerable'))) {
      rarity = 'rare';
    } else if (categories.some(c => c.includes('near threatened'))) {
      rarity = 'uncommon';
    } else if (categories.some(c => c.includes('least concern'))) {
      rarity = 'common';
    }

    // Priority 2: IUCN Red List status in text / General abundance language
    if (!rarity) {
      rarity = 'common'; // default
      if (
        searchText.includes('critically endangered') ||
        searchText.includes('critically endangered (cr)') ||
        searchText.includes('iucn: cr')
      ) {
        rarity = 'rare';
      } else if (
        searchText.includes('endangered') ||
        searchText.includes('iucn: en') ||
        searchText.includes('vulnerable') ||
        searchText.includes('iucn: vu') ||
        searchText.includes('rare species') ||
        searchText.includes('rarely seen') ||
        searchText.includes('seldom seen') ||
        searchText.includes('restricted range') ||
        searchText.includes('highly localised') ||
        searchText.includes('highly localized')
      ) {
        rarity = 'rare';
      } else if (
        searchText.includes('near threatened') ||
        searchText.includes('iucn: nt') ||
        searchText.includes('uncommon') ||
        searchText.includes('locally uncommon') ||
        searchText.includes('patchily distributed') ||
        searchText.includes('scarce') ||
        searchText.includes('declining')
      ) {
        rarity = 'uncommon';
      } else if (
        searchText.includes('least concern') ||
        searchText.includes('iucn: lc') ||
        searchText.includes('widespread') ||
        searchText.includes('abundant') ||
        searchText.includes('very common') ||
        searchText.includes('commonly found') ||
        searchText.includes('commonly seen') ||
        searchText.includes('one of the most common')
      ) {
        rarity = 'common';
      }
    }

    console.log(`[Wikipedia] "${species}" → diet=${diet}, flight=${flight}, habitat=${habitat}, rarity=${rarity}`);
    return { lore, diet, flight, habitat, rarity };

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
    rarity: 'common',
  };
}

module.exports = { identifyBird, scrapeBirdInfo };