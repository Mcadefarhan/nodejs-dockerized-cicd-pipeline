// Downloads one real photo per product into public/images/<id>.jpg
// Pick ONE provider by setting its key:
//   PIXABAY_API_KEY=xxx   npm run images     (free key, shown instantly after signup: https://pixabay.com/api/docs/)
//   UNSPLASH_ACCESS_KEY=xxx npm run images   (free "Demo" app key: https://unsplash.com/developers, limit 50 requests/hour)
// Existing .jpg files are skipped, so re-run the script any time to fill in what is missing.
const fs = require('fs');
const path = require('path');
const products = require('../products');

const PIXABAY = process.env.PIXABAY_API_KEY;
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY;
if (!PIXABAY && !UNSPLASH) {
  console.error('Set PIXABAY_API_KEY or UNSPLASH_ACCESS_KEY first (see top of tools/fetch-images.js).');
  process.exit(1);
}

const out = path.join(__dirname, '..', 'public', 'images');
const used = new Set();
const wait = ms => new Promise(r => setTimeout(r, ms));

async function findPixabay(q) {
  const url = `https://pixabay.com/api/?key=${PIXABAY}&q=${encodeURIComponent(q.slice(0, 100))}&image_type=photo&orientation=vertical&per_page=20&safe_search=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay ${res.status}`);
  const { hits } = await res.json();
  const h = (hits || []).find(x => !used.has('px' + x.id));
  return h && { key: 'px' + h.id, src: h.largeImageURL || h.webformatURL, by: h.user };
}

async function findUnsplash(q) {
  const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20&orientation=portrait`,
    { headers: { Authorization: `Client-ID ${UNSPLASH}` } });
  if (res.status === 403 || res.status === 429) throw new Error('Unsplash hourly limit reached. Wait an hour and run again, finished photos are kept.');
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  const { results } = await res.json();
  const h = (results || []).find(x => !used.has('un' + x.id));
  if (!h) return null;
  fetch(h.links.download_location, { headers: { Authorization: `Client-ID ${UNSPLASH}` } }).catch(() => {}); // Unsplash asks apps to ping this
  return { key: 'un' + h.id, src: h.urls.regular, by: h.user.name };
}

(async () => {
  const find = PIXABAY ? findPixabay : findUnsplash;
  for (const p of products) {
    const dest = path.join(out, `${p.id}.jpg`);
    if (fs.existsSync(dest)) continue;
    try {
      const pick = await find(p.query);
      if (!pick) { console.warn(`#${p.id} no result for "${p.query}"`); continue; }
      used.add(pick.key);
      const img = await fetch(pick.src);
      if (!img.ok) throw new Error(`download ${img.status}`);
      fs.writeFileSync(dest, Buffer.from(await img.arrayBuffer()));
      console.log(`saved #${p.id} ${p.name} (photo by ${pick.by})`);
    } catch (e) {
      console.error(`#${p.id} ${e.message}`);
      if (/limit/i.test(e.message)) break;
    }
    await wait(PIXABAY ? 700 : 300);
  }
  console.log('Done. Commit public/images so Jenkins/Docker include them.');
})();