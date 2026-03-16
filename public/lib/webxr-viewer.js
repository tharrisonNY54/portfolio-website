(function () {
  "use strict";

  const canvas = document.getElementById("canvas");

  let isDragging = false;
  let lastX = 0, lastY = 0;

  let theta = 0;
  let phi = 0.5;
  let radius = 3.0;

  let camX = 0, camY = 0, camZ = 0;

  let fetchingNewVideo = false;
  let audioLoadStarted = false;

  let paused = true;
  let lastDrawTime = NaN;

  let video = null;
  let videoCommonResources = null;
  let audioElement = null;

  let gl = null;
  let xrSession = null;
  let xrRefSpace = null;
  let fatalError = false;

  const statusElement = document.getElementById("status");

  const overlay = document.getElementById("tapToPlayOverlay");
  const controlBar = document.getElementById("controlBar");
  const pauseBtn = document.getElementById("pauseBtn");
  const muteBtn = document.getElementById("muteBtn");
  const seekSlider = document.getElementById("seekSlider");


  
  function reportFatalError(message) {
    fatalError = true;
    try {
      if (audioElement) {
        audioElement.pause();
      }
    } catch (e) {
      // ignore
    }
    try {
      if (statusElement) {
        statusElement.textContent = message;
      }
      const warningEl = document.getElementById("warning");
      if (warningEl) {
        warningEl.textContent = message;
      }
    } catch (e) {
      // ignore
    }
    try {
      window.dispatchEvent(new CustomEvent("ScannedRealityFatalError", {
        detail: { message }
      }));
    } catch (e) {
      // ignore
    }
  }

  function isScannedRealityWorkerError(msg) {
    if (!msg) return false;
    const s = String(msg);
    return s.includes("XRVideo_update") ||
      s.includes("out of bounds") ||
      s.includes("getWasmTableEntry") ||
      s.includes("memory access") ||
      s.includes("dav1d_get_picture") ||
      s.includes("dav1d") ||
      s.includes("worker sent an error") ||
      s.includes("returned -48") ||
      s.includes("RuntimeError") ||
      s.includes("Aborted");
  }

  function attachGlobalErrorHandlers() {
    if (typeof window === "undefined") return;

    window.addEventListener("error", function (event) {
      if (fatalError) return;
      const msg = event && event.message ? String(event.message) : "";
      const alt = (event && event.error && (event.error.message || (event.error.toString && event.error.toString()))) ? String(event.error.message || event.error.toString()) : "";
      const combined = msg + " " + alt;
      if (isScannedRealityWorkerError(combined)) {
        reportFatalError("This hologram cannot be decoded in WebXR on this device.");
      }
    });

    window.addEventListener("unhandledrejection", function (event) {
      if (fatalError) return;
      let msg = "";
      if (event && event.reason) {
        const r = event.reason;
        msg = (r && r.message ? String(r.message) : "") + " " + (r && r.toString ? r.toString() : String(r));
      }
      if (isScannedRealityWorkerError(msg)) {
        reportFatalError("This hologram cannot be decoded in WebXR on this device.");
      }
    });
  }

  attachGlobalErrorHandlers();

  /**
   * updates camera position based on spherical angles theta, phi and radius
   * @returns {void}
   */
  // function updateCameraFromAngles() {
  //   camX = radius * Math.sin(theta) * Math.cos(phi);
  //   camY = radius * Math.sin(phi);
  //   camZ = radius * Math.cos(theta) * Math.cos(phi);
  // }

  // updateCameraFromAngles();

  
  // mouse and touch event handlers for orbit camera
  canvas.addEventListener("pointerdown", e => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("pointerup", () => {
    isDragging = false;
  });

  window.addEventListener("pointermove", e => {
    if (!isDragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    theta -= dx * 0.01;
    phi -= dy * 0.01;
    phi = Math.max(-1.3, Math.min(1.3, phi));

    // updateCameraFromAngles();
  });

  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    radius += e.deltaY * 0.01;
    radius = Math.max(0.5, Math.min(10, radius));
    // updateCameraFromAngles();
  }, { passive: false });


  /**
   *  this is the main function that initializes WebGL, ScannedReality player
   *  gets called once when user taps the overlay
   *  gets video url from window._reactSelectedVideoUrl and loads the video + corresponding wav file
   * @returns 
   */
  async function main() {
    statusElement.textContent = "Creating WebGL";

    gl = canvas.getContext("webgl2", {
      xrCompatible: true,
      alpha: true
    });

    if (!gl) {
      alert("WebGL2 not supported");
      return;
    }

    // this is the same as main.js where it loads the scannedreality player
    statusElement.textContent = "Initializing ScannedReality";

    let playerModule;
    try {
      playerModule = await scannedreality.initialize("/lib/", canvas);
    } catch (e) {
      reportFatalError("Failed to initialize ScannedReality WebXR player.");
      return;
    }

    videoCommonResources = scannedreality.newVideoCommonResources(playerModule);
    if (!videoCommonResources.isInitialized()) {
      reportFatalError("Failed to initialize ScannedReality common resources.");
      return;
    }

    // Choose decoded-frame cache based on device to balance memory and smoothness.
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const cachedFrames = isIOS ? 2 : (isMobile ? 8 : 60);

    video = scannedreality.newVideo(cachedFrames, false, videoCommonResources);
    if (!video.isInitialized()) {
      reportFatalError("Failed to initialize ScannedReality XR video.");
      return;
    }


    // loads video from the given url. Audio starts only after video reaches Ready (see renderScene).
    fetchAndLoadVideoFromUrl(window._reactSelectedVideoUrl);

  }

  /**
   * this function gets called once when user taps the overlay
   * attempts to start an immersive XR session (AR preferred, VR fallback)
   * so it works on both AR‑capable phones and VR devices like Quest
   * @returns {Promise<boolean>}
   */
  async function startXR() {
    if (!navigator.xr || !gl) {
      console.warn("[webxr-viewer] navigator.xr or WebGL context not available");
      return false;
    }

    let mode = null;

    try {
      const supportsAR = await navigator.xr.isSessionSupported("immersive-ar");
      const supportsVR = await navigator.xr.isSessionSupported("immersive-vr");

      if (supportsAR) {
        mode = "immersive-ar";
      } else if (supportsVR) {
        mode = "immersive-vr";
      }
    } catch (err) {
      console.warn("[webxr-viewer] Error while checking XR support", err);
      mode = null;
    }

    if (!mode) {
      console.warn("[webxr-viewer] No immersive AR/VR mode supported");
      return false;
    }

    const sessionInit = mode === "immersive-ar"
      ? {
          requiredFeatures: ["local-floor"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: document.body }
        }
      : {
          requiredFeatures: ["local-floor"],
          optionalFeatures: []
        };

    try {
      xrSession = await navigator.xr.requestSession(mode, sessionInit);
    } catch (e) {
      var msg = (e && e.message) ? String(e.message) : "";
      var name = (e && e.name) ? String(e.name) : "";
      var isNotAllowed = name === "SecurityError" || name === "NotAllowedError" ||
        /not allowed|permission|denied|user denied/i.test(msg);
      if (isNotAllowed) {
        try {
          window.dispatchEvent(new CustomEvent("ScannedRealityXRNotAllowed", { detail: { message: msg } }));
        } catch (ev) {}
        return false;
      }
      console.warn("[webxr-viewer] requestSession failed", e);
      return false;
    }

    try {
      await gl.makeXRCompatible();

      const layer = new XRWebGLLayer(xrSession, gl, {
        framebufferScaleFactor: 1.0
      });

      xrSession.updateRenderState({ baseLayer: layer });

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      xrRefSpace = await xrSession.requestReferenceSpace("local-floor");

      xrSession.requestAnimationFrame(drawXR);
      return true;
    } catch (e) {
      var msg2 = (e && e.message) ? String(e.message) : "";
      var name2 = (e && e.name) ? String(e.name) : "";
      var isNotAllowed2 = name2 === "SecurityError" || name2 === "NotAllowedError" ||
        /not allowed|permission|denied/i.test(msg2);
      if (isNotAllowed2) {
        try {
          window.dispatchEvent(new CustomEvent("ScannedRealityXRNotAllowed", { detail: { message: msg2 } }));
        } catch (ev) {}
      }
      console.warn("[webxr-viewer] XR setup failed after requestSession", e);
      return false;
    }
  }


  /**
   * this function gets called every XR frame
   * updates the video and renders the scene for each view
   * @param {*} time is a timestamp indicating the current time
   * @param {*} frame is an XRFrame object providing information about the current XR frame
   * @returns {void}
   */
  function drawXR(time, frame) {
    if (fatalError) {
      try {
        frame.session.end();
      } catch (e) {
        // ignore
      }
      return;
    }

    frame.session.requestAnimationFrame(drawXR);

    const pose = frame.getViewerPose(xrRefSpace);
    if (!pose) return;

    const glLayer = frame.session.renderState.baseLayer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

    // Clear once per frame
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const view of pose.views) {
      const viewport = glLayer.getViewport(view);

      gl.viewport(
        viewport.x,
        viewport.y,
        viewport.width,
        viewport.height
      );

      renderScene(
        time * 0.001,
        view.projectionMatrix,
        view.transform.inverse.matrix
      );
    }
  }



  /**
   * this is a helper function that renders the scene for a given projection and view matrix
   * @param {*} time is a timestamp indicating the current time
   * @param {*} projectionMatrix is the projection matrix for the current view
   * @param {*} viewMatrix is the view matrix for the current view
   * @returns  {void}
   */
  function renderScene(time, projectionMatrix, viewMatrix) {
    if (!video || !video.isLoaded()) return;

    if (video.getAsyncLoadState() === scannedreality.XRVideoAsyncLoadState.Error) {
      reportFatalError("Unable to decode this hologram in WebXR on this device.");
      return;
    }

    if (!audioLoadStarted && video.getAsyncLoadState() === scannedreality.XRVideoAsyncLoadState.Ready && window._reactSelectedVideoUrl) {
      audioLoadStarted = true;
      const wavUrl = window._reactSelectedVideoUrl.replace(/\.\w+$/, ".wav");
      if (wavUrl) fetchAndLoadWavFile(wavUrl);
    }

    // Place hologram in front of user
    const model = m4.translation(0, 1.3, -1.5);

    const mvp = m4.multiply(
      projectionMatrix,
      m4.multiply(viewMatrix, model)
    );

    try {
      video.update(!paused && !isNaN(lastDrawTime) ? time - lastDrawTime : 0);
    } catch (e) {
      reportFatalError("A playback error occurred in the WebXR hologram viewer.");
      return;
    }

    if (!paused) {
      const start = video.getStartTimestamp();
      const end = video.getEndTimestamp();
      const t = video.getPlaybackTimestamp();
      seekSlider.value = (t - start) / (end - start);
    }

    const lock = video.prepareRenderLock();
    try {
      video.render(viewMatrix, mvp, false, lock);
    } catch (e) {
      reportFatalError("A rendering error occurred in the WebXR hologram viewer.");
      return;
    } finally {
      video.destroyRenderLock(lock);
    }

    lastDrawTime = time;
  }




  /**
   * this is a helper function that fetches video data from the given url and loads it into the video player
   * @param {*} url is the url of the video to fetch
   * @returns {void}
   */
  function fetchAndLoadVideoFromUrl(url) {
    fetchingNewVideo = true;
    fetch(url, { cache: "no-store" })
      .then(r => r.arrayBuffer())
      .then(buf => {
        video.load(buf, scannedreality.XRVideoPlaybackMode.SingleShot);
        fetchingNewVideo = false;
      });
  }

  /**
   * this is a similar helper function that fetches a wav audio file from the given url and loads it 
   * into an HTMLAudioElement
   * @param {*} url is the url of the wav file to fetch
   */
  function fetchAndLoadWavFile(url) {
    fetch(url)
      .then(r => r.blob())
      .then(b => {
        audioElement = new Audio(URL.createObjectURL(b));
        audioElement.play();
      });
  }


  // event listeners for overlay and control bar buttons
  overlay.addEventListener("click", async () => {
    overlay.style.display = "none";
    paused = false;

    controlBar.style.opacity = "1";
    controlBar.style.pointerEvents = "auto";

    main();

    await startXR();
  });


  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Play" : "Pause";
    if (audioElement) paused ? audioElement.pause() : audioElement.play();
  });

  muteBtn.addEventListener("click", () => {
    if (!audioElement) return;
    audioElement.muted = !audioElement.muted;
    muteBtn.textContent = audioElement.muted ? "Unmute" : "Mute";
  });

  seekSlider.addEventListener("input", () => {
    if (!video || !video.isLoaded()) return;
    const start = video.getStartTimestamp();
    const end = video.getEndTimestamp();
    video.seek(start + seekSlider.value * (end - start), true);
  });

})();
