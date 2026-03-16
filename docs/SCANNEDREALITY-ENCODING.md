## ScannedReality Encoding & Testing Guidelines

This project uses the ScannedReality WebAssembly player to render volumetric `.xrv` clips. To keep playback reliable—especially on mobile and in WebXR—follow these guidelines when preparing and publishing new clips.

**Official ScannedReality WebXR example note:** ScannedReality’s own WebXR example states that at the time of writing, browser support for WebXR was still very limited. The example was tested with **Chrome on Android** and the **Meta Quest Browser on Meta Quest 2**. **iOS did not support WebXR yet.** See [caniuse.com/webxr](https://caniuse.com/webxr) for current support. **Safari:** Caniuse reports that WebXR can be enabled in Safari via the **WebXR Device API** experimental feature. In practice the option is not always visible:
- **macOS:** Safari → **Settings** → **Advanced** → check **“Show Develop menu in menu bar”**, then **Develop** → **Experimental Features** and look for **“WebXR Device API”**.
- **iOS:** **Settings** → **Safari** → **Advanced** → **Experimental Features** (or **Feature Flags**) and look for **“WebXR Device API”**.
- **If you don’t see it:** Apple may not expose this flag in your Safari or iOS version yet, or it may be in **Safari Technology Preview** only. For now, use the **non‑XR (standard) viewer** on Safari/iOS; WebXR remains best supported on Chrome Android and Quest. This app uses the **non‑XR (standard) viewer on iOS** by default; the WebXR viewer is used when the device reports support (e.g. Android Chrome, Quest, or Safari with the feature enabled). Decoding failures on iOS (out of bounds, dav1d, Aborted) occur in the standard viewer’s worker, not in WebXR.

### Recommended Encoding Constraints

- **Clip duration**
  - Prefer clips **≤ 30–45 seconds** for mobile WebXR.
  - Longer clips can work on desktop, but are more likely to run into decoding/memory limits on mobile browsers.

- **Resolution & complexity**
  - Use ScannedReality’s recommended export presets for **web/mobile** where available.
  - Avoid extremely dense geometry or unnecessarily high voxel resolution for mobile‑targeted clips.

- **Bitrate**
  - Keep AV1 bitrate conservative for mobile; overly aggressive quality settings increase decoder load and memory pressure.

### Engine / Library Version

- The Next.js app (`scannedreality-website`) and any standalone ScannedReality viewer **must share the same `lib` build**:
  - `scannedreality-player.js`
  - `scannedreality-player.wasm`
  - `scannedreality-player.worker.js`
  - `scannedreality-player-simd.worker.js`
  - `wasm-feature-detect-umd.js`
- When upgrading ScannedReality, update the root `lib/` and copy those files into `scannedreality-website/public/lib/` so both experiences behave identically.

### Cross‑Device Test Matrix

For each new hologram clip:

1. **Desktop (baseline)**
   - Browser: latest Chrome or Edge on Windows/macOS.
   - Steps:
     - Open the main site.
     - Navigate to the project/session.
     - Start the clip and let it run end‑to‑end.
   - Verify:
     - Hologram plays smoothly.
     - Audio sync feels acceptable.
     - Orbit controls and UI respond.

2. **iOS Safari (non‑XR viewer)**
   - Device: recent iPhone or iPad running a supported iOS/iPadOS version.
   - Steps:
     - Open the site in Safari.
     - Navigate to the same clip.
   - Verify:
     - The **standard (non‑XR) viewer** appears.
     - Clip plays without fatal errors (no “unwind”, “out of bounds memory access”, or `dav1d_get_picture()` errors in the console).
   - If decoding fails:
     - Re‑encode the clip with lower duration / resolution / bitrate, or
     - Flag the clip as desktop/Quest only.

3. **Android WebXR (where available)**
   - Device: recent Android phone with Chrome that supports WebXR.
   - Steps:
     - Open the site in Chrome.
     - Start the clip; confirm whether the WebXR viewer is selected.
   - Verify:
     - Either the WebXR viewer enters immersive mode successfully, or
     - The app falls back gracefully to the non‑XR viewer with a clear message if WebXR isn’t available.

4. **Quest Browser (WebXR)**
   - Device: Meta Quest with Oculus/Meta Browser.
   - Steps:
     - Open the site in the Quest browser.
     - Launch a ScannedReality clip.
   - Verify:
     - WebXR viewer runs in **VR** mode.
     - Hologram appears at a comfortable distance.
     - No fatal WASM/worker errors.

### Failure Handling & Fallbacks

- If the ScannedReality engine encounters a fatal error (e.g. WASM “out of bounds memory access”, `dav1d_get_picture()` failures), the viewers will:
  - Stop playback.
  - Surface a human‑readable message in the UI.
  - Dispatch a `ScannedRealityFatalError` event that the React layer can use to switch to a 2D fallback.

- To enable a 2D fallback for a clip:
  - Add `fallbackVideoUrl` to the corresponding `Take` in the content index or CloudFront `index.txt`.
  - On failure, the React viewer will hide the volumetric canvas and render a standard `<video>` player using that URL.

### Ways to Fix Mobile Decoding Failures (Out of Bounds / dav1d / Aborted)

The crash happens inside ScannedReality’s WASM/worker (AV1/dav1d decoder). You can’t fix the decoder from this repo, but these steps can remove or reduce the failure:

1. **Use the same `lib` as a known‑good viewer**  
   If the same clip plays in another ScannedReality viewer on the same device (e.g. their official demo), that viewer is using a different build. Copy that viewer’s `lib` files into this app’s `public/lib/` (and root `lib/` if you use it):  
   `scannedreality-player.js`, `scannedreality-player.wasm`, `scannedreality-player.worker.js`, `scannedreality-player-simd.js`, `scannedreality-player-simd.wasm`, `scannedreality-player-simd.worker.js`, `wasm-feature-detect-umd.js`.  
   Matching the known‑good build often fixes the crash.

2. **Re‑encode the clip for mobile**  
   Encode with ScannedReality’s **web/mobile** presets: shorter duration (e.g. ≤ 30–45 s), lower resolution, and conservative AV1 bitrate. Some streams trigger decoder edge cases on mobile; a lighter encode can avoid them.

3. **Try even lower decode cache on iOS**  
   In `main.js` and `webxr-viewer.js`, `cachedFrames` is 8 for iOS. You can try 4 or 2 to reduce memory pressure (may help if the crash is OOM‑related; no guarantee if it’s a decoder bug).

4. **Ask ScannedReality for a mobile‑friendly build**  
   Request a build that disables or softens the failing path (e.g. different dav1d flags, or a single‑threaded/no‑worker build for mobile). They may already have one or a workaround.

5. **Keep the 2D fallback**  
   Set `fallbackVideoUrl` for the take so that when decoding fails, the app shows the 2D video. That’s a reliable workaround; the options above aim to fix playback in the volumetric viewer itself.

### Publishing Checklist (Per Clip)

- [ ] Encoded with web/mobile‑friendly settings (duration, resolution, bitrate).
- [ ] Verified in a desktop browser (Chrome/Edge) end‑to‑end.
- [ ] Verified in iOS Safari (non‑XR viewer) for basic playback.
- [ ] Verified on at least one WebXR‑capable device (Android or Quest) where applicable.
- [ ] Optional: `fallbackVideoUrl` configured and tested for critical clips where mobile support is required.

