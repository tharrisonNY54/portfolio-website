# Deploy 3 holograms to GitHub Pages (portfolio-website)

This folder becomes the **entire contents** of [tharrisonNY54/portfolio-website](https://github.com/tharrisonNY54/portfolio-website), replacing the current site. The live URL will be **https://tharrisonny54.github.io/portfolio-website/**.

---

## 1. Set your 3 hologram URLs

Edit **index.html** and replace the placeholder links with your real CloudFront URLs.

Each hologram needs two URLs:
- **videoUrl** – the `.mp4` file
- **bytesUrl** – the `.bytes` file

Example for one link:
```html
<a href="viewer.html?videoUrl=https://dpyy1piv6s0hg.cloudfront.net/YourPath/Clip1.mp4&bytesUrl=https://dpyy1piv6s0hg.cloudfront.net/YourPath/Clip1.bytes">Hologram 1</a>
```

If a URL contains `&`, `#`, or `=`, encode it for the query string (e.g. `&` → `%26`).

---

## 2. Build the 8th Wall app

From the **ScannedRealityWebsite** repo root:

```bash
cd 8thWallCode
npm install
npm run build
```

This creates `8thWallCode/dist/` with `bundle.js`, `external/`, etc.

---

## 3. Copy built files into this folder

Copy from `8thWallCode/dist/` into **portfolio-holograms/**:

- **bundle.js** → `portfolio-holograms/bundle.js`
- **external/** (entire folder) → `portfolio-holograms/external/`

So after copying, `portfolio-holograms/` contains:

- `index.html` (your list of 3 holograms)
- `viewer.html` (AR viewer)
- `bundle.js`
- `external/` (all 8th Wall and module scripts)
- `DEPLOY.md` (this file; optional to keep)

---

## 4. Push to your portfolio-website repo

**Option A – Replace the repo contents**

1. Clone your portfolio repo (if you don’t have it):
   ```bash
   git clone https://github.com/tharrisonNY54/portfolio-website.git
   cd portfolio-website
   ```
2. Delete everything inside the repo **except** `.git`.
3. Copy the entire contents of **portfolio-holograms** (including `index.html`, `viewer.html`, `bundle.js`, `external/`) into the repo root.
4. Commit and push:
   ```bash
   git add -A
   git commit -m "Replace with 3-hologram 8th Wall viewer"
   git push origin main
   ```

**Option B – From ScannedRealityWebsite**

If you have a separate clone of portfolio-website, you can copy the contents of `portfolio-holograms` into that clone’s root and push from there.

---

## 5. GitHub Pages

1. On GitHub: **Settings → Pages** for [portfolio-website](https://github.com/tharrisonNY54/portfolio-website).
2. Set **Source** to **Deploy from a branch**.
3. Branch: **main** (or **master**), folder: **/ (root)**.
4. Save. The site will be at **https://tharrisonny54.github.io/portfolio-website/**.

---

## 6. 8th Wall app registration

8th Wall needs your site URL allowed for the app:

1. In the [8th Wall console](https://www.8thwall.com/), open your app.
2. Add **https://tharrisonny54.github.io** (or the exact portfolio-website URL) to the allowed domains if required.

---

## QR codes

- **Main page (list of 3):**  
  `https://tharrisonny54.github.io/portfolio-website/`  
  or `https://tharrisonny54.github.io/portfolio-website/index.html`

- **Direct to a hologram (for separate QR per hologram):**  
  `https://tharrisonny54.github.io/portfolio-website/viewer.html?videoUrl=...&bytesUrl=...`  
  Use the same URLs you put in the links in `index.html` (URL-encode if needed).
