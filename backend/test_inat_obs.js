const axios = require('axios');

async function testINatObservations(species, month) {
  try {
    const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(species)}&month=${month}&per_page=50&has[]=geo&quality_grade=research`;
    console.log('Fetching from:', url);
    const res = await axios.get(url, { headers: { 'User-Agent': 'WingdexTest/1.0' } });
    const obs = res.data.results;
    console.log(`Found ${obs.length} observations for ${species} in month ${month}`);
    if (obs.length > 0) {
      console.log('Sample coordinates:', obs[0].location);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testINatObservations('House sparrow', 1);
testINatObservations('House sparrow', 6);
