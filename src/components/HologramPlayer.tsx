"use client";

import { useEffect, useState } from "react";
import { detectXrCapabilities } from "@/lib/xr-capabilities";

interface HologramPlayerInfo {
  videoUrl: string;
  fallbackVideoUrl?: string;
}

export default function HologramPlayer({ videoUrl, fallbackVideoUrl }: HologramPlayerInfo) {
  const [fatalError, setFatalError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //
  // 1. Store video URL globally so both main.js and XR script can access it
  //
  useEffect(() => {
    (window as any)._reactSelectedVideoUrl = videoUrl;
    (window as any)._reactFallbackVideoUrl = fallbackVideoUrl;
  }, [videoUrl]);

  //
  // 2. Decide whether to load XR viewer or normal viewer
  //
  useEffect(() => {
    let cancelled = false;

    async function setupViewer() {
      // If XR was denied (e.g. "not allowed" / permission), force normal viewer and clear flag
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("scannedreality-force-normal") === "1") {
        sessionStorage.removeItem("scannedreality-force-normal");
        loadNormalViewer();
        return;
      }
      if (cancelled) return;

      const caps = await detectXrCapabilities();
      if (cancelled) return;

      // Policy:
      // - Quest or any browser with real WebXR support: use WebXR viewer.
      // - iOS Safari: use non‑XR viewer (no WebXR support yet, but engine still works).
      // - Everything else: non‑XR viewer unless WebXR is explicitly supported.
      const shouldUseXR =
        !caps.isIOS && (caps.isQuestBrowser || caps.supportsWebXR);

      if (shouldUseXR) {
        loadXRViewer();
      } else {
        loadNormalViewer();
      }
    }

    setupViewer();

    return () => {
      cancelled = true;
    };
  }, []);

  //
  // 3. Listen for fatal errors coming from the viewer scripts
  //
  useEffect(() => {
    function handleFatal(event: Event) {
      const anyEvent = event as any;
      const detail = anyEvent.detail || {};
      if (detail.message) {
        setErrorMessage(String(detail.message));
      }
      setFatalError(true);
    }

    function handleXRNotAllowed() {
      sessionStorage.setItem("scannedreality-force-normal", "1");
      window.location.reload();
    }

    window.addEventListener("ScannedRealityFatalError", handleFatal as EventListener);
    window.addEventListener("ScannedRealityXRNotAllowed", handleXRNotAllowed);
    return () => {
      window.removeEventListener("ScannedRealityFatalError", handleFatal as EventListener);
      window.removeEventListener("ScannedRealityXRNotAllowed", handleXRNotAllowed);
    };
  }, []);

  if (fatalError && fallbackVideoUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
        <p className="mb-4 text-center text-sm md:text-base">
          {errorMessage || "This hologram cannot be decoded on this device. Showing 2D video instead."}
        </p>
        <video
          controls
          playsInline
          className="w-full max-w-xl rounded-lg border border-white/20 bg-black"
          src={fallbackVideoUrl}
        />
      </div>
    );
  }

  //
  // 3. Load XR Scripts (WebXR)
  //
  function loadXRViewer() {
    if (window.__XR_VIEWER_ALREADY_LOADED__) return;
    window.__XR_VIEWER_ALREADY_LOADED__ = true;

    const scripts = [
      "/lib/scannedreality-player-api.js",
      "/lib/scannedreality-player.js",
      "/lib/scannedreality-player-simd.js",
      "/lib/wasm-feature-detect-umd.js",
      "/lib/m4.js",
      "/lib/webxr-viewer.js"
    ];

    scripts.forEach((src) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      document.body.appendChild(s);
    });
  }

  function loadNormalViewer() {
    if (window.__NORMAL_VIEWER_ALREADY_LOADED__) return;
    window.__NORMAL_VIEWER_ALREADY_LOADED__ = true;

    const scripts = [
      "/lib/m4.js",
      "/lib/main.js",
      "/lib/scannedreality-player-api.js",
      "/lib/scannedreality-player.js",
      "/lib/scannedreality-player-simd.js",
      "/lib/wasm-feature-detect-umd.js",
      "/lib/scannedreality-player-simd.worker.js",
      "/lib/scannedreality-player.worker.js"
    ];

    scripts.forEach((src) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      document.body.appendChild(s);
    });
  }

  return (
      <div
        dangerouslySetInnerHTML={{
          __html: `
          <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: block;
          }

          #tapToPlayOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            z-index: 10;
            cursor: pointer;
          }
          #xrUIWrapper { display:none; position:fixed; inset:0; z-index:20;
            align-items:center; justify-content:center; flex-direction:column; color:white;
          }
          .xr-button {
            border:2px solid #4db8ff;
            padding:14px 22px;
            margin-top:1rem;
            background:rgba(255,255,255,0.8);
            font-size:18px;
            cursor:pointer;
          }
          </style>


        <div id="canvasContainer">

          <div id="tapToPlayOverlay"
              style="
                position:absolute; inset:0;
                background:rgba(0,0,0,0.85);
                color:white; font-size:26px;
                display:flex; align-items:center; justify-content:center;
                z-index:10; cursor:pointer;
              ">
            Tap to Play
          </div>


          <!-- Canvas -->
          <canvas id="canvas"
            style="width:100%; height:100%; background:black;"></canvas>

       

          <p>
            <p>
              <b>File:</b> <span id="videoFilename">${videoUrl}</span>
          </p>



          <p>
            <b>Status:</b> <span id="status">Page load</span>
          </p>

          <!-- Bottom control bar -->
          <div id="controlBar"
                style="
                  position:absolute; bottom:0; left:0; right:0;
                  height:42px;
                  background:rgba(0,0,0,0.55);
                  display:flex;
                  align-items:center;
                  padding:0 10px;
                  gap:10px;
                  opacity:0.3;
                  pointer-events:none;   /* disabled until tap */
                  transition:opacity 0.25s;
                  z-index:11;
                ">

          <!-- Pause button -->
          <button id="pauseBtn"
                      style="
                        flex:0 0 12%;
                        height:30px;
                        background:#222;
                        color:white;
                        border:1px solid #444;
                        cursor:pointer;
                      ">
                Pause
              </button>

          <!-- Seek bar -->
          <input id="seekSlider"
           type="range"
           min="0" max="1" step="0.001" value="0"
           style="flex:1; height:4px; cursor:pointer;" />

          <!-- Mute button -->
          <button id="muteBtn"
                    style="
                      flex:0 0 12%;
                      height:30px;
                      background:#222;
                      color:white;
                      border:1px solid #444;
                      cursor:pointer;
                    ">
              Mute
            </button>
        </div>

        <!-- XR VIEWER UI  -->
        <div id="xrUIWrapper">
          <h2>ScannedReality WebXR</h2>
          <div id="xrWarning" style="color:#ff4444;"></div>
          <div id="warning" style="margin-bottom: 1em; color: #ca0000;"></div>
          <button id="arButton" class="xr-button" disabled>AR Loading...</button>
          <button id="vrButton" class="xr-button" disabled>VR Loading...</button>
        </div>
      `
        }}
      />


  );
}
