const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PROXIES = [
  { host: '31.59.20.176', port: 6754, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '31.56.127.193', port: 7684, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '45.38.107.97', port: 6014, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '38.154.203.95', port: 5863, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '198.105.121.200', port: 6462, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '64.137.96.74', port: 6641, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '198.23.243.226', port: 6361, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '38.154.185.97', port: 6370, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '142.111.67.146', port: 5611, username: 'hjvwzjir', password: '0y59d4vk85ln' },
  { host: '191.96.254.138', port: 6185, username: 'hjvwzjir', password: '0y59d4vk85ln' }
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
];

function getRandomProxy() {
  return PROXIES[Math.floor(Math.random() * PROXIES.length)];
}

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

app.get('/price', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.json({ error: 'No name provided' });

  try {
    const proxy = getRandomProxy();
    const url = `https://www.cardmarket.com/es/Pokemon/Products/Singles?searchString=${encodeURIComponent(name)}&sortBy=price_asc&minCondition=7`;

    const response = await axios.get(url, {
      proxy: {
        host: proxy.host,
        port: proxy.port,
        auth: { username: proxy.username, password: proxy.password }
      },
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // Intentar varios selectores de precio
    let price = '';
    const selectors = [
      '.price-container span',
      '.col-price span',
      '.article-price',
      '[data-price]',
      '.price'
    ];
    
    for (const sel of selectors) {
      const found = $(sel).first().text().trim();
      if (found && found.includes('€')) {
        price = found;
        break;
      }
    }

    res.json({ name, price: price || 'Sin precio', url });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Scraper running on port', process.env.PORT || 3000));
