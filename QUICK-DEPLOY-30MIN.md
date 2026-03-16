# 3 Holograms on GitHub Pages — 30‑minute checklist (8th Wall only)

**What to upload:** Everything inside the **`portfolio-holograms`** folder. No other parts of this repo are needed.

---

## What’s in portfolio-holograms (upload all of this)

| Item | Purpose |
|------|--------|
| **index.html** | Landing page with 3 hologram links |
| **viewer.html** | 8th Wall AR viewer (tap ground to place) |
| **bundle.js** | Your 8th Wall app logic |
| **external/** | 8th Wall SDK, xrextras, modules, videogram — **entire folder** |

You do **not** need: `8thWallCode/`, `player-main/`, `scannedreality-website/`, `lib/`, or any other folder in the repo.

---

## Steps (≈30 min)

### 1. (Optional) Set your 3 hologram URLs — 2 min

Edit **portfolio-holograms/index.html**. Each link needs:

- **videoUrl** = your `.mp4` URL  
- **bytesUrl** = your `.bytes` URL  

Example for one link:
```html
<a href="viewer.html?videoUrl=https://YOUR-CDN/Clip1.mp4&bytesUrl=https://YOUR-CDN/Clip1.bytes">Hologram 1</a>
```
If your URLs already point to your CloudFront (or other CDN) files, you can skip this.

---

### 2. Create or use a GitHub repo for the site — 2 min

- **Option A:** Use an existing repo (e.g. `username/portfolio-website`).
- **Option B:** Create a new repo named **`username.github.io`** (e.g. `jane.github.io`) for a direct URL like `https://jane.github.io`.

---

### 3. Replace repo contents with portfolio-holograms — 5 min

In a terminal, in the folder where you have that repo cloned:

**Windows (PowerShell):**
```powershell
# Go to your GitHub Pages repo
cd path\to\your\portfolio-website   # or username.github.io

# Remove everything except .git
Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force

# Copy portfolio-holograms into repo root (adjust path if needed)
Copy-Item -Path "d:\CDH - Hologram Website\ScannedRealityWebsite\portfolio-holograms\*" -Destination "." -Recurse -Force
```

**Mac/Linux:**
```bash
cd path/to/your/portfolio-website
rm -rf * .[!.]* 2>/dev/null; rm -rf .git 2>/dev/null; # only if you're sure - better: delete manually except .git
# Then copy:
cp -R "/path/to/ScannedRealityWebsite/portfolio-holograms/"* .
```

---

### 4. Commit and push — 2 min

```bash
git add -A
git status
git commit -m "3 holograms – 8th Wall viewer"
git push origin main
```

(Use `master` if that’s your default branch.)

---

### 5. Turn on GitHub Pages — 1 min

1. On GitHub: repo → **Settings** → **Pages**.
2. **Source:** Deploy from a branch.
3. **Branch:** `main` (or `master`), folder: **/ (root)**.
4. Save. In 1–2 minutes the site is live.

---

### 6. Allow your domain in 8th Wall — 2 min

1. Open [8th Wall Console](https://www.8thwall.com/).
2. Open your app.
3. Add your GitHub Pages URL (e.g. `https://username.github.io` or `https://username.github.io/portfolio-website`) to allowed domains if your plan requires it.

---

## URLs you’ll have

- **List of 3 holograms:**  
  `https://YOUR-USERNAME.github.io/portfolio-website/`  
  (or `https://YOUR-USERNAME.github.io/` if repo is `username.github.io`)

- **Direct to one hologram:**  
  `https://YOUR-USERNAME.github.io/portfolio-website/viewer.html?videoUrl=...&bytesUrl=...`

Use these for QR codes or sharing.

---

## If something breaks

- **Build step:** You only need to run `npm run build` in `8thWallCode` and copy `bundle.js` + `external/` into `portfolio-holograms` if you change the 8th Wall app code. For a quick deploy, the existing `portfolio-holograms` is already built.
- **HTTPS:** GitHub Pages is HTTPS; 8th Wall and camera APIs require it. You’re good.
- **CORS:** All 8th Wall and module scripts are loaded from the same origin (your Pages site); no CORS issues for the viewer itself. Your hologram assets (`.mp4`/`.bytes`) must be on a CDN or host that allows cross-origin requests if needed.
