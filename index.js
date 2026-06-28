const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PROXY_HOST = 'p.webshare.io';
const PROXY_PORT = 80;
const PROXY_PASS = '0y59d4vk85ln';

const USERNAMES = [
  'hjvwzjir-gb-1', 'hjvwzjir-ca-2', 'hjvwzjir-de-3',
  'hjvwzjir-fr-4', 'hjvwzjir-au-5', 'hjvwzjir-nl-6',
  'hjvwzjir-it-7', 'hjvwzjir-es-8', 'hjvwzjir-be-9', 'hjvwzjir-at-10'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

app.get('/price', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.json({ error: 'No name provided' });

  try {
    const username = getRandom(USERNAMES);
    const url = `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(name)}&view=grid`;

    const response = await axios.get(url, {
      proxy: {
        host: PROXY_HOST,
        port: PROXY_PORT,
        auth: { username, password: PROXY_PASS }
      },
      headers: {
        'User-Agent': getRandom(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    let price = '';
    const selectors = [
      '.inventory__price-with-shipping',
      '.product-card__market-price',
      '.price-point__data',
      '[data-testid="product-card-market-price"]'
    ];
    
    for (const sel of selectors) {
      const found = $(sel).first().text().trim();
      if (found && found.includes('$')) {
        price = found;
        break;
      }
    }

    res.json({ name, price: price || 'Sin precio', source: 'TCGPlayer' });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Scraper running'));
