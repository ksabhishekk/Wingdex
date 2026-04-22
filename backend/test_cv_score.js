const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config({ path: 'c:/Apps/Wingdex/backend/.env' });

async function test() {
  const formData = new FormData();
  // using any image file that exists, package.json works as a dummy file if the API allows bad images, 
  // but let's just make a dummy blank image buffer
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  formData.append('image', buffer, 'test.png');

  try {
    const res = await axios.post(
      'https://api.inaturalist.org/v1/computervision/score_image',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.INAT_TOKEN}`,
        }
      }
    );
    console.log("Score structure:", res.data.results[0]);
  } catch(e) {
    console.log("Error", e.message);
  }
}
test();
