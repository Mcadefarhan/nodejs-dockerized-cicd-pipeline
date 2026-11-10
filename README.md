# STRUT – Men's accessories store (CI/CD practice project)

Run locally:  `npm install && npm start`  → http://localhost:3000
Test:         `npm test`
Docker:       `docker build -t strut-store . && docker run -p 3000:3000 strut-store`

Jenkins setup: Jenkinsfile me `YOUR_DOCKERHUB_USER`, `YOUR_EC2_PUBLIC_IP`, `MAIL_TO` badlo.
Credentials: `dockerhub-creds` (username/password), `ec2-ssh` (SSH key). Jenkins user ko docker group me add karo.
GitHub > Settings > Webhooks > `http://<jenkins>:8080/github-webhook/`

## Product images (real photos)
68 products across 7 sections. Each product shows `public/images/<id>.jpg` and falls back to a placeholder illustration (`<id>.svg`) until the photo exists.

Get real photos in one command (free Pexels key from https://www.pexels.com/api/):

    PEXELS_API_KEY=your_key npm run images

It downloads one photo per product using the `query` field in `products.js`. Existing `.jpg` files are skipped, so you can swap any photo by hand (4:5 portrait works best). Commit `public/images` so Jenkins/Docker builds include them.
