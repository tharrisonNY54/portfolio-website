(function() {

  "use strict";

  // Global error / state flags
  let fatalError = false;

  let isDragging = false;
  let lastX = 0, lastY = 0;

  // spherical camera control
  let theta = 0;
  let phi = 0.5;
  let radius = 3.0;

  function updateCameraFromAngles() {
    camX = radius * Math.sin(theta) * Math.cos(phi);
    camY = radius * Math.sin(phi);
    camZ = radius * Math.cos(theta) * Math.cos(phi);
  }

  // DRAG ROTATION
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    // INVERTED TO MATCH USER DRAG DIRECTION
    theta -= dx * 0.01;
    phi   -= dy * 0.01;

    // clamp vertical angle
    phi = Math.max(-1.3, Math.min(1.3, phi));

    updateCameraFromAngles();
  });

  // ZOOM (scroll wheel)
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();

    radius += e.deltaY * 0.01;

    radius = Math.max(0.5, Math.min(10, radius));

    updateCameraFromAngles();
  });


  /**
   * Helper function resizeCanvasToDisplaySize(), taken from:
   * 
   *   https://github.com/greggman/twgl.js
   * 
   * License:
   * ####################################################################
   * Copyright 2019 Gregg Tavares
   * 
   * Permission is hereby granted, free of charge, to any person
   * obtaining a copy of this software and associated documentation
   * files (the "Software"), to deal in the Software without restriction,
   * including without limitation the rights to use, copy, modify, merge,
   * publish, distribute, sublicense, and/or sell copies of the Software,
   * and to permit persons to whom the Software is furnished to do so,
   * subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
   * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
   * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
   * DEALINGS IN THE SOFTWARE.
   * ####################################################################
   */
  /**
   * Resize a canvas to match the size it's displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] So you can pass in `window.devicePixelRatio` or other scale value if you want to.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:twgl
   */
  function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    multiplier = Math.max(0, multiplier);
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  // Converts degrees to radians
  function degToRad(d) {
    return d * Math.PI / 180;
  }

  // Settings, set by the input fields
  var paused;
  var useSurfaceNormalShading;
  var camX;
  var camY;
  var camZ;
  var red;
  var green;
  var blue;

  // The video and related objects
  var videoCommonResources = null;
  var video = null;
  var lastDrawTime = NaN;
  var fetchingNewVideo = false;
  var audioLoadStarted = false;

  function reportFatalError(message) {
    fatalError = true;
    try {
      if (typeof audioElement !== "undefined" && audioElement) {
        audioElement.pause();
      }
    } catch (e) {
      // ignore
    }
    try {
      var statusElement = document.getElementById("status");
      if (statusElement) {
        statusElement.innerHTML = message;
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
    var s = String(msg);
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
      var msg = event && event.message ? String(event.message) : "";
      var alt = (event && event.error && (event.error.message || event.error.toString && event.error.toString())) ? String(event.error.message || event.error.toString()) : "";
      var combined = msg + " " + alt;
      if (isScannedRealityWorkerError(combined)) {
        reportFatalError("This hologram cannot be decoded on this device.");
      }
    });

    window.addEventListener("unhandledrejection", function (event) {
      if (fatalError) return;
      var msg = "";
      if (event && event.reason) {
        var r = event.reason;
        msg = (r && r.message ? String(r.message) : "") + " " + (r && r.toString ? r.toString() : String(r));
      }
      if (isScannedRealityWorkerError(msg)) {
        reportFatalError("This hologram cannot be decoded on this device.");
      }
    });
  }

  attachGlobalErrorHandlers();

  // Main function of example
  function main() {
    var statusElement = document.getElementById('status');
    // Create a WebGL 2 context
    statusElement.innerHTML = "creating WebGL context";
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
      alert("Failed to create WebGL 2 context");
      return;
    }
    
    // Initialize the ScannedReality player module once at the start,
    // providing the URI to the "lib" directory (this must end with a slash if non-empty).
    // This call returns a promise that resolves to the loaded player module on success.
    // Once we receive that, we call initScene().
    statusElement.innerHTML = "initializing ScannedReality module";
    scannedreality.initialize("/lib/", canvas)
      .then((playerModule) => {
        initScene(playerModule);
      })
      .catch((error) => {
        alert('Failed to initialize player: ' + error);
      });
    
    // Initializes the scene
    function initScene(playerModule) {
      statusElement.innerHTML = "initializing the scene";
      
      // Initialize common resources (shaders, etc.) for XRVideo files once at the start.
      videoCommonResources = scannedreality.newVideoCommonResources(playerModule);
      if (!videoCommonResources.isInitialized()) {
        alert("Failed to initialize common video resources");
        return;
      }
      
      // Initialize an XRVideo object, passing in the common resources allocated above.
      // cachedDecodedFrameCount determines how many decoded video frames will remain cached,
      // which greatly influences the memory requirements. Passing 0 for cachedDecodedFrameCount
      // will lead to all frames in the video being cached. This is only appropriate for very
      // short video clips. See the documentation comment on newVideo() in
      // lib/scannedreality-player-api.js for more details. Note that for iOS / Safari, we limit
      // the maximum WebAssembly memory used to 1GB, as larger maximum sizes do not seem to be supported by these.
      // Thus, please make sure not to use too much memory when targeting these.
      // Choose decoded-frame cache based on device to balance memory and smoothness.
      var ua = navigator.userAgent || "";
      var isIOS = /iPhone|iPad|iPod/i.test(ua);
      var isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
      var cachedFrames = isIOS ? 2 : (isMobile ? 8 : 60);
      video = scannedreality.newVideo(/*cachedDecodedFrameCount*/ cachedFrames, /*verboseDecoding*/ false, videoCommonResources);
      if (!video.isInitialized()) {
        alert("Failed to initialize the video");
        return;
      }
      
      // Fetch and load the XRVideo file asynchronously. Audio starts only after video reaches Ready (see drawScene).
      statusElement.innerHTML = "fetching the video";
      fetchAndLoadVideoFromUrl(window._reactSelectedVideoUrl);
    }
    
      // Function that draws the scene, called for each displayed frame
    function drawScene(time) {
      if (fatalError) {
        return;
      }
      // Convert the current time to seconds
      time *= 0.001;
      
      // Make sure that the canvas size remains sane after resizing
      resizeCanvasToDisplaySize(canvas, window.devicePixelRatio ? window.devicePixelRatio : 1);
      
      // Set the viewport to match the canvas
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      // Clear the color and depth buffer
      gl.clearColor(red, green, blue, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
      // Define our desired projection matrix
      var fieldOfViewRadians = degToRad(40);
      var aspect = canvas.clientWidth / canvas.clientHeight;
      var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 0.1, 100);
      
      // Define our desired camera matrix.
      // Note that at the time of writing, there is no designated "forward direction" for
      // ScannedReality videos yet, although this may be defined in the future.
      var cameraPosition = [camX, camY, camZ];
      var target = [0, 0.8, 0];
      var up = [0, 1, 0];
      var cameraMatrix = m4.lookAt(cameraPosition, target, up);
      var viewMatrix = m4.inverse(cameraMatrix);
      
      // Define the desired model matrix for the ScannedReality video
      var modelMatrix = m4.identity();
      
      // Combine the model, view, and projection matrices
      var modelViewMatrix = m4.multiply(viewMatrix, modelMatrix);
      var modelViewProjectionMatrix = m4.multiply(projectionMatrix, modelViewMatrix);
      
      // Has the video file been provided to the video object yet?
      if (video !== null && video.isLoaded()) {
        try {
        var statusText =
            paused ? "paused" :
            (video.isBuffering() ? `buffering (${Math.round(video.getBufferingProgressPercent())}%)` : "playing");
        if (video.getAsyncLoadState() === scannedreality.XRVideoAsyncLoadState.Ready) {
          statusText += `, timestamp: ${video.getPlaybackTimestamp()}`;
        } else {
          statusText += ` (loading)`;
        }
        if (statusElement.innerHTML != statusText) {
          statusElement.innerHTML = statusText;
        }

        if (video.getAsyncLoadState() === scannedreality.XRVideoAsyncLoadState.Error) {
          reportFatalError("Unable to decode this hologram on this device.");
          return;
        }
        
        // Advance the video playback (unless we want the video to pause),
        // passing in the elapsed time in seconds since the last call to drawScene().
        // 
        // Note that this function implicitly discards the update
        // if the video is currently in the "buffering" state, meaning that not enough video frames
        // have been decoded in the background yet to allow for starting playback, to allow
        // for the video frame decoding to catch up.
        video.update((!paused && !Number.isNaN(lastDrawTime)) ? (time - lastDrawTime) : 0);
        
        // Prepare rendering the current timestamp of the video,
        // retrieving a render lock for use with render().
        // This may do offscreen rendering to perform computations on the GPU, therefore the
        // OpenGL render target states (framebuffer, viewport, ...) must be reset after calling this!
        var renderLock = video.prepareRenderLock();
        
        // Reset viewport after prepareRenderLock().
        // If not using the default framebuffer, it must be reset as well.
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        // Render the current video frame.
        // Note: After video.isLoaded() starts returning true, for a short period of time it
        // can happen that nothing will be rendered by the call below yet. This is because the first
        // video frame may still need to be decoded (which happens in the background).
        // You may call video.switchedToMostRecentVideo() to determine whether a frame of the most
        // recently loaded video can be displayed.
        video.render(modelViewMatrix, modelViewProjectionMatrix, useSurfaceNormalShading, renderLock);
        
        // After rendering, destroy the render lock.
        video.destroyRenderLock(renderLock);
        
        // Note that video.prepareRenderLock() and video.render() may have changed OpenGL state.
        // The following is a list of states to consider resetting to known values after these
        // function calls, if desired. There is currently no guarantee for the list to be complete
        // or remain constant over updates to the library.
        // - glEnable / glDisable (GL_DEPTH_TEST)
        // - glEnable / glDisable (GL_CULL_FACE)
        // - glActiveTexture()
        // - glBindTexture(GL_TEXTURE_2D) for texture units GL_TEXTURE0 + {0, 1, 2, 3}
        // - glBindBuffer(GL_ARRAY_BUFFER)
        // - glBindBuffer(GL_ELEMENT_ARRAY_BUFFER)
        // - glUseProgram()
        
        // If the video switched to the most recently loaded video file,
        // show the video's start and end timestamps in the UI,
        // and start audio once playback is ready (so audio doesn't play before decode may fail).
        if (video.switchedToMostRecentVideo() && video.getAsyncLoadState() === scannedreality.XRVideoAsyncLoadState.Ready && !fetchingNewVideo) {
          if (!audioLoadStarted && window._reactSelectedVideoUrl) {
            audioLoadStarted = true;
            var wavUrl = window._reactSelectedVideoUrl.replace(/\.[^.]+$/, ".wav");
            if (wavUrl) fetchAndLoadWavFile(wavUrl);
          }
          if (video && video.isLoaded()) {
          const start = video.getStartTimestamp();
          const end = video.getEndTimestamp();
          const t = video.getPlaybackTimestamp();

          const progress = (t - start) / (end - start);
          seekSlider.value = Math.min(Math.max(progress, 0), 1);


          // if (audioElement && !audioElement.muted) {
          //   audioElement.currentTime = t - start;
          // }
        }
        }
        } catch (e) {
          reportFatalError("An error occurred while rendering this hologram.");
          return;
        }
      } else {
        // The video has not been loaded yet.
        // A loading indicator could be displayed here meanwhile.
      }
      
      // Remember the timestamp of this call to drawScene() such that we will be able to
      // compute the elapsed time when it is called the next time.
      lastDrawTime = time;
      
      // Request the next animation frame, which will call drawScene() again.
      if (!fatalError) {
        window.requestAnimationFrame(drawScene);
      }
    }
    
    // Request the first animation frame, which will call drawScene().
    window.requestAnimationFrame(drawScene);
  }

  function fetchAndLoadVideo() {
    // Determine which video should be fetched
    var fileExample1 = document.getElementById("fileExample1");
    var fileExample2 = document.getElementById("fileExample2");
    
    var selectedFilePath;
    if (fileExample1.checked) {
      selectedFilePath = fileExample1.value;
    } else {
      selectedFilePath = fileExample2.value;
    }
    
    // While fetching the video, temporarily disable the file selectors
    fileExample1.disabled = true;
    fileExample2.disabled = true;
    fetchingNewVideo = true;
    
    // Fetch the video file.
    // ( Documentation on fetch(): https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch )
    window.fetch(selectedFilePath, {cache: "no-store"})
      .then((response) => {
        if (!response.ok) {
          alert('Failed to fetch video file: Network response was not OK');
        }
        return response.arrayBuffer();
      })
      .then((videoBuffer) => {
        // Load the video from the fetched buffer, and set the initial playback mode.
        // Note that load() returns immediately; the video frames will subsequently be
        // asynchronously decoded in the background.
        video.load(videoBuffer, getSelectedPlaybackMode());
        fetchingNewVideo = false;
      })
      .catch((error) => {
        alert('Failed to fetch video file:' + error);
      });
  }

  function fetchAndLoadVideoFromUrl(url) {
    fetchingNewVideo = true;
    window.fetch(url, { cache: "no-store" })
      .then(res => res.arrayBuffer())
      .then(buffer => {
        try {
          video.load(buffer, getSelectedPlaybackMode());
        } catch (e) {
          reportFatalError("Failed to load hologram data.");
        } finally {
          fetchingNewVideo = false;
        }
      })
      .catch(err => {
        reportFatalError("Network error while loading hologram.");
      });
  }


  function fetchAndLoadWavFile(url) {
    fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Get the response body as a Blob
      return response.blob();
    })
    .then(audioBlob => {
      // audioBlob now contains the WAV file data
      // You can use this Blob to create an Object URL or process it further
      const objectURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(objectURL);
      // Play the audio
      audio.play();
    })
    .catch(error => {
      console.error('Error fetching or playing audio:', error);
    });
  }

  function updateFile() {
    // Only change the video if the scene has been loaded initially
    if (video !== null && video.isLoaded()) {
      fetchAndLoadVideoFromUrl(window._reactSelectedVideoUrl);
    }
  }

  /// Returns the playback mode that is currently selected in the UI
  function getSelectedPlaybackMode() {
    return scannedreality.XRVideoPlaybackMode.SingleShot;
    // if (document.getElementById("modeSingleShot").checked) {
      
    // } else if (document.getElementById("modeLoop").checked) {
    //   return scannedreality.XRVideoPlaybackMode.Loop;
    // } else {
    //   return scannedreality.XRVideoPlaybackMode.BackAndForth;
    // }
  }

  /// Called when a value in a UI input field has been updated.
  /// Sets the corresponding global variables to the values retrieved from the input fields.
  // function update() {
  //   paused = document.getElementById("pause").checked;
  //   useSurfaceNormalShading = document.getElementById("normalColors").checked;
  //   if (video !== null && video.isLoaded()) {
  //     video.setPlaybackMode(getSelectedPlaybackMode());
  //   }
  //   camX = document.getElementById("camX").value;
  //   camY = document.getElementById("camY").value;
  //   camZ = document.getElementById("camZ").value;
  //   red = document.getElementById("red").value;
  //   green = document.getElementById("green").value;
  //   blue = document.getElementById("blue").value;
  // }

  /// This function gets called when the "Go" button for seeking is clicked.
  // function seekGo() {
  //   // Only do seeking if the video has been loaded already
  //   if (video !== null && video.isLoaded() && video.getAsyncLoadState() === scannedreality.XRVideoAsyncLoadState.Ready) {
  //     video.seek(parseFloat(document.getElementById("seekTo").value), /*forward*/ true);
  //   }
  // }

  // Get the initial values of the UI input fields
  // update();

  // Start the main loop



  var overlay = document.getElementById("tapToPlayOverlay");
  paused = true;

  // overlay.addEventListener("click", () => {
  //   overlay.style.display = "none";
  //   paused = false;
  //   main();
  // });


  var overlay = document.getElementById("tapToPlayOverlay");
  var controlBar = document.getElementById("controlBar");
  var pauseBtn = document.getElementById("pauseBtn");
  var muteBtn = document.getElementById("muteBtn");
  var seekSlider = document.getElementById("seekSlider");

  paused = true; // start paused until tap

  updateCameraFromAngles();
  overlay.addEventListener("click", () => {
    overlay.style.display = "none";
    paused = false;

    // enable control bar
    controlBar.style.opacity = "1";
    controlBar.style.pointerEvents = "auto";

    main();
  });

  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Play" : "Pause";

    if (audioElement) {
      if (paused) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  });


  let audioElement = null;

  function fetchAndLoadWavFile(url) {
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        audioElement = new Audio(url);
        audioElement.play();
      })
      .catch(console.error);
  }

  muteBtn.addEventListener("click", () => {
    if (!audioElement) return;

    audioElement.muted = !audioElement.muted;
    muteBtn.textContent = audioElement.muted ? "Unmute" : "Mute";
  });

  seekSlider.addEventListener("input", () => {
    if (!video || !video.isLoaded()) return;

    const start = video.getStartTimestamp();
    const end = video.getEndTimestamp();
    const t = video.getPlaybackTimestamp();
    const val = parseFloat(seekSlider.value);

    const ts = start + val * (end - start);
    video.seek(ts, true);

    if (audioElement) {
      audioElement.currentTime = t - start;
    }
  });



})();

