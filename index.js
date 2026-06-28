const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PROXIES = [
  'hjvwzjir:0y59d4vk85ln@31.59.20.176:6754',
  'hjvwzjir:0y59d4vk85ln@31.56.127.193:7684',
  'hjvwzjir:0y59d4vk85ln@45.38.107.97:6014',
  'hjvwzjir:0y59d4vk85ln@38.154.203.95:5863',
  'hjvwzjir:0y59d4vk85ln@198.105.121.200:6462',
  'hjvwzjir:0y59d4vk85ln@64.137.96.74:6641',
  'hjvwzjir:0y59d4vk85ln@198.23.243.226:6361',
  'hjvwzjir:0y59d4vk85ln@38.154.185.97:6370',
  'hjvwzjir:0y59d4vk85ln@142.111.67.146:5611',
  'hjvwzjir:0y59d4vk85ln@191.96.254.138:6185'
];

function getRandomProxy() {
  return PROXIES[Math.floor(Math.random() * PROXIES.length)];
}

app.get('/price', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.json({ error: 'No name provided' });

  try {
    const proxy = getRandomProxy();
    const [auth, host] = proxy.split('@');
    const [username, password] = auth.split(':');
    const [proxyHost, proxyPort] = host.split(':');

    const url = `https://www.cardmarket.com/es/Pokemon/Products/Singles?searchString=${encodeURIComponent(name)}&sortBy=price_asc&minCondition=7`;

    const response = await axios.get(url, {
      proxy: { host: proxyHost, port: parseInt(proxyPort), auth: { username, password } },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const price = $('.price-container').first().text().trim();

    res.json({ name, price: price || 'Sin precio' });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Scraper running'));
