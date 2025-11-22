# Volumetric Video Integration Options

## Layout Options for Hero Section

### Option A: Split 50/50 Layout (Current, but make video larger)
- **Left 50%**: Text content (name, subtitle, buttons)
- **Right 50%**: Volumetric player taking full height
- Make video fill the right column completely (maybe 400-500px wide, full column height)
- Remove intro text box, integrate text into left column

### Option B: Video-Dominant Layout (60/40)
- **Left 40%**: Compact text content
- **Right 60%**: Large volumetric player as main focal point
- Video becomes the hero's primary visual element
- Text is secondary but still prominent

### Option C: Full-Width Hero with Overlay
- Video takes up entire hero section (full width, ~600-800px height)
- Text content overlays on top with semi-transparent background
- Very dramatic, video-first approach
- Text positioned absolutely over the video

### Option D: Stacked with Video on Top
- Video takes up top 60-70% of hero section (full width)
- Text content below the video
- Single column, vertical layout
- Video is the first thing visitors see

### Option E: Side-by-Side with Video Larger
- Keep current grid but make video column wider
- Use `grid-template-columns: 1fr 1.5fr` (text smaller, video larger)
- Video becomes more prominent while keeping text visible

---

## Self-Hosting Options for Volumetric Capture

### Option 1: 8th Wall SDK Integration (Recommended if you have license)
**Requirements:**
- 8th Wall account and API key
- 8th Wall JavaScript SDK
- Proper CORS headers on your server
- Volumetric video player component

**Implementation:**
```javascript
// Load 8th Wall SDK
<script src="https://apps.8thwall.com/xrextras/xrextras.js"></script>
<script src="https://apps.8thwall.com/xrextras/xrextras-browsercontrols.js"></script>

// Initialize volumetric video
XRExtras.Loading.show({onxrloaded: () => {
  XRExtras.FullWindowCanvas({canvas: document.getElementById('canvas')});
  // Load your .mp4 and .bytes files
  const videoUrl = './20251121_1617_56.mp4';
  const metadataUrl = './20251121_1617_56.bytes';
  // Initialize volumetric player
}});
```

**Pros:**
- Full control over rendering
- Can customize size, position, interactions
- No iframe limitations
- Better performance

**Cons:**
- Requires 8th Wall license/API key
- More complex setup
- Need to handle CORS properly

---

### Option 2: Three.js + Volumetric Video Player
**Requirements:**
- Three.js library
- Custom volumetric video decoder
- WebGL shader for rendering

**Implementation:**
```javascript
// Use libraries like:
// - @google/model-viewer (for simpler cases)
// - Custom Three.js volumetric video player
// - Volumetric video format decoder

import * as THREE from 'three';
// Load .mp4 and .bytes, decode volumetric data
// Render with Three.js scene
```

**Pros:**
- Open source, no licensing fees
- Full customization
- Can integrate with any 3D library

**Cons:**
- Most complex to implement
- Need to write/adapt volumetric decoder
- May need to convert format

---

### Option 3: Model Viewer (Simpler Alternative)
**Requirements:**
- Convert volumetric to 3D model format (GLB/GLTF)
- @google/model-viewer library

**Implementation:**
```html
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
<model-viewer src="your-model.glb" ar ar-modes="webxr scene-viewer" camera-controls></model-viewer>
```

**Pros:**
- Simple to implement
- Works well on web
- Good browser support

**Cons:**
- Need to convert volumetric video to 3D model
- Loses video/animation aspect
- Static or limited animation

---

### Option 4: WebXR + Custom Player
**Requirements:**
- WebXR API
- Custom volumetric video decoder
- Three.js or Babylon.js

**Implementation:**
```javascript
// Use WebXR directly
navigator.xr.requestSession('immersive-ar').then(session => {
  // Load volumetric video
  // Decode .mp4 and .bytes
  // Render in AR session
});
```

**Pros:**
- Native browser support
- No third-party dependencies
- Full control

**Cons:**
- Complex implementation
- Need volumetric decoder
- Browser support varies

---

### Option 5: Use Existing Volumetric Video Libraries
**Libraries to explore:**
- **Looking Glass Factory SDK** - Has volumetric video support
- **Hologram SDK** - For holographic displays
- **8th Wall Community Examples** - Open source volumetric players
- **Three.js Volumetric Video Examples** - GitHub repos

**Implementation:**
```javascript
// Example with Looking Glass SDK
import { LookingGlassWebXRPolyfill } from '@lookingglass/webxr';
// Load and render volumetric video
```

---

### Option 6: Convert to Different Format
**Options:**
- Convert to **Gaussian Splatting** (.ply format) - you mentioned this in your resume!
- Use **Splat Viewer** libraries
- Convert to **NeRF** format
- Use **Meshroom** or **RealityCapture** to create 3D model

**Pros:**
- You already have experience with Gaussian Splatting
- Many open-source viewers available
- Can be more performant
- Better browser compatibility

**Cons:**
- Need conversion process
- May lose some quality
- Different file format

---

## Recommended Approach

### For Layout:
**Option B (60/40 Video-Dominant)** or **Option E (Side-by-Side Larger Video)**
- Makes video very visible
- Keeps text readable
- Professional balance

### For Self-Hosting:
**Option 6 (Gaussian Splatting)** - Since you have experience with it!
- You mentioned Gaussian Splatting in your resume
- Use a library like `@gaussian-splatting/web` or `splat-viewer`
- Convert your volumetric capture to .ply format
- More control, better performance, no licensing issues

**OR**

**Option 1 (8th Wall SDK)** - If you have access
- Full control over size and rendering
- Native volumetric video support
- Professional solution

---

## Next Steps

1. **Decide on layout** - Which hero layout do you prefer?
2. **Choose self-hosting method** - Gaussian Splatting conversion or 8th Wall SDK?
3. **File conversion** (if needed) - Convert .mp4/.bytes to chosen format
4. **Implementation** - I can help implement whichever you choose

Let me know which direction you want to go!

