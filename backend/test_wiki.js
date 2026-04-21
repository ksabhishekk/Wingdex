const axios = require('axios');

async function testCategories(title) {
  try {
    const res = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodeURIComponent(title)}&redirects=1&cllimit=500&format=json`, {
      headers: {
        'User-Agent': 'WingdexTest/1.0 (test-script)'
      }
    });
    const pages = res.data.query.pages;
    const categories = [];
    for (const pageId in pages) {
      if (pages[pageId].categories) {
        pages[pageId].categories.forEach(c => categories.push(c.title));
      }
    }
    console.log(`Categories for ${title}:`, categories);
  } catch (err) {
    console.error(err);
  }
}

testCategories('Kakapo');
