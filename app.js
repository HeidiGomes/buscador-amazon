const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Add CORS header
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/scrape', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const url = `https://www.amazon.com.br/s?k=${keyword}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = [];

    $('div[data-component-type="s-search-result"]').each((index, element) => {
      const title = $(element).find('h2 > a').text().trim();
      const price = $(element).find('span[class="a-offscreen"]').first().text().trim();
      const rating = $(element).find('span[class="a-icon-alt"]').text().trim();
      const reviewCount = $(element).find('span[class="a-size-base"]').first().text().trim();
      const imageURL = $(element).find('img').attr('src');

      const product = {
        title: title,
        price: price,
        rating: rating,
        reviewCount: reviewCount,
        imageURL: imageURL
      };
      products.push(product);
    });

    res.json(products);
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Rota para servir o arquivo HTML estático
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
