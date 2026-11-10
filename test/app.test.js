const request = require('supertest');
const app = require('../server');

describe('STRUT store', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/products returns all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(10);
  });

  test('GET /api/products?cat=watch filters by category', async () => {
    const res = await request(app).get('/api/products?cat=watch');
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every(p => p.cat === 'watch')).toBe(true);
  });

  test('GET / serves the homepage', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('STRUT');
  });

  test('every category has at least 8 products', async () => {
    const res = await request(app).get('/api/products');
    const count = {};
    res.body.forEach(p => { count[p.cat] = (count[p.cat] || 0) + 1; });
    ['tshirt', 'shirt', 'watch', 'shoe', 'chain', 'cap', 'extra'].forEach(c => expect(count[c]).toBeGreaterThanOrEqual(8));
  });
});
