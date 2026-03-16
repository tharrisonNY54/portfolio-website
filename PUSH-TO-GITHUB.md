# Push to GitHub (portfolio-website)

Do this **after** the build and copy steps are done (they're already done if you ran the walkthrough).

## Option A: You already have portfolio-website cloned

1. Open PowerShell or Terminal and go to your portfolio-website folder:
   ```powershell
   cd path\to\portfolio-website
   ```

2. Remove everything in the repo **except** the `.git` folder (so we replace the site with the hologram app):
   ```powershell
   Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force
   ```

3. Copy the contents of **portfolio-holograms** into this folder:
   ```powershell
   Copy-Item -Path "d:\CDH - Hologram Website\ScannedRealityWebsite\portfolio-holograms\*" -Destination "." -Recurse -Force
   ```

4. Commit and push:
   ```powershell
   git add -A
   git status
   git commit -m "Replace with 3-hologram 8th Wall viewer"
   git push origin main
   ```

## Option B: Clone fresh, then replace and push

1. Clone the repo (use a **new empty folder**):
   ```powershell
   cd d:\CDH - Hologram Website\ScannedRealityWebsite
   git clone https://github.com/tharrisonNY54/portfolio-website.git portfolio-website-deploy
   cd portfolio-website-deploy
   ```

2. Remove all files except `.git`:
   ```powershell
   Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force
   ```

3. Copy portfolio-holograms contents in:
   ```powershell
   Copy-Item -Path "..\portfolio-holograms\*" -Destination "." -Recurse -Force
   ```

4. Commit and push:
   ```powershell
   git add -A
   git commit -m "Replace with 3-hologram 8th Wall viewer"
   git push origin main
   ```

## After pushing

1. On GitHub: repo **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**.
4. Save. In 1–2 minutes the site will be at **https://tharrisonny54.github.io/portfolio-website/**.
