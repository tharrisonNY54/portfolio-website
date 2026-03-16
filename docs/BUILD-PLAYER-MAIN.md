# How to Build player-main and Copy Lib into This App

This checklist describes how to build the official ScannedReality **player-main** repo with Emscripten and copy the generated library files into this app. Use this if you want to try the **official** WASM/worker build (e.g. to test whether it fixes mobile decoder crashes).

## Prerequisites

- **Emscripten SDK** installed and on your PATH (`emcc`, `emcmake`). See https://emscripten.org/docs/getting_started/downloads.html.
- **CMake** 3.17 or newer.
- The **player-main** directory (official ScannedReality GitHub repo) at the path referenced below; adjust paths if yours differs.

## 1. Configure and build player-main

From the **player-main** root (same level as `CMakeLists.txt`):

1. Create a build directory and configure with the Emscripten toolchain. Example (Unix/macOS/Git Bash):

   ```bash
   mkdir build-web && cd build-web
   emcmake cmake .. -DCMAKE_BUILD_TYPE=Release
   ```

   On Windows with Emscripten in the PATH, use the same in a shell where `emcmake` and `emcc` are available.

2. Build the **Release** configuration (the copy-to-`dist` step runs only in Release):

   ```bash
   cmake --build . --config Release
   ```

3. The build copies the library artifacts into:
   - `player-main/dist/scannedreality-player-library-web/lib/`

   You should see there:
   - `scannedreality-player.js`, `scannedreality-player.wasm`, `scannedreality-player.worker.js`
   - `scannedreality-player-simd.js`, `scannedreality-player-simd.wasm`, `scannedreality-player-simd.worker.js`

   (The repo may also contain `scannedreality-player-api.js` and `wasm-feature-detect-umd.js` in that `lib/`; we do **not** overwrite our `scannedreality-player-api.js` with the official one, because ours includes the iOS SIMD workaround.)

## 2. Copy lib files into this app

Copy **only** the six built files above from:

- **Source:** `player-main/dist/scannedreality-player-library-web/lib/`

into:

- **Destination (this app):** `scannedreality-website/public/lib/`

Files to copy:

- `scannedreality-player.js`
- `scannedreality-player.wasm`
- `scannedreality-player.worker.js`
- `scannedreality-player-simd.js`
- `scannedreality-player-simd.wasm`
- `scannedreality-player-simd.worker.js`

**Do not** overwrite in this app:

- `scannedreality-player-api.js` (keep our version; it has the iOS SIMD workaround.)
- `wasm-feature-detect-umd.js` (optional to replace from player-main; we keep it in sync separately.)

If you also use the root `lib/` in this repo (e.g. for a standalone viewer), copy the same six files there so both places stay in sync.

## 3. Verify

Run the Next.js app and open a session that plays a ScannedReality clip. Confirm that the player loads and that playback (and, if applicable, WebXR) works. If you were testing to address mobile decoder crashes, try the same clip on the failing device again.

## Reference

- player-main build: `player-main/cmake/exe_viewer_web.cmake` (POST_BUILD copies on Release).
- Our API and viewer behavior: see [SCANNEDREALITY-ENCODING.md](./SCANNEDREALITY-ENCODING.md) and the “player-main vs. Our Codebase” plan.
