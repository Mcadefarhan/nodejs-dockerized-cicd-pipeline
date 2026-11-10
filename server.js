const express = require('express');
const path = require('path');
const products = require('./products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/products', (req, res) => {
  const { cat } = req.query;
  res.json(cat ? products.filter(p => p.cat === cat) : products);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`STRUT running on port ${PORT}`));
}

module.exports = app;
