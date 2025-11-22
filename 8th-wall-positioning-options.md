# 8th Wall Positioning Options

## The Problem
The 8th Wall volumetric video currently allows users to place/move the character by tapping the ground. You want it to always appear in the same fixed position.

## Solutions

### Option 1: Configure in 8th Wall Editor (Recommended)
The most reliable way is to configure the experience in the 8th Wall editor:

1. **Log into 8th Wall Console** (https://console.8thwall.com/)
2. **Open your volumetric experience project**
3. **Look for placement/anchoring settings:**
   - Find "Placement Mode" or "Anchor Settings"
   - Change from "User Placement" to "Fixed Position" or "World Lock"
   - Set a default position (e.g., center of screen, 1 meter away)
4. **Disable tap-to-place:**
   - Look for "Interaction Settings"
   - Disable "Tap to Place" or "Ground Placement"
   - Enable "Auto-place" or "Fixed Position"

### Option 2: URL Parameters (May Not Work)
Some 8th Wall experiences support URL parameters. I've added these to the code, but they may not work depending on how your experience was configured:

- `?disablePlacement=true`
- `?fixedPosition=true`
- `?autoPlace=true`

These are already added to your shortlink. If they don't work, you'll need Option 1.

### Option 3: Custom Script Parameters
If you have access to modify the 8th Wall experience code, you can:

```javascript
// In your 8th Wall scene code
AFRAME.registerComponent('fixed-placement', {
  init: function() {
    // Disable ground placement
    this.el.sceneEl.addEventListener('tapstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);
    
    // Set fixed position
    this.el.setAttribute('position', '0 1.6 -1'); // Example position
  }
});
```

### Option 4: World-Locked Placement
Configure the volumetric character to be "world-locked" instead of "space-locked":
- World-locked: Fixed position relative to the real world (doesn't move with device)
- Space-locked: Follows the camera (appears in same screen position)

### Current Implementation
I've added URL parameters to your shortlink in `js/main.js`. These may or may not work depending on your 8th Wall configuration.

**To fully fix this, you'll likely need to reconfigure in the 8th Wall editor (Option 1).**

---

## Testing the Current Solution

The shortlink now includes positioning parameters:
```
https://8th.io/hf5xb?disablePlacement=true&fixedPosition=true
```

If the character still allows placement after this update, you'll need to configure it in the 8th Wall editor.

---

## 8th Wall Editor Settings to Look For

When in the 8th Wall editor, look for these settings:

1. **Placement/Anchoring:**
   - "Placement Mode" → Set to "Fixed" or "Auto"
   - "Default Position" → Set coordinates (e.g., X:0, Y:1.6, Z:-1)

2. **Interaction:**
   - "Tap to Place" → Disable
   - "Ground Detection" → Optional (can disable if not needed)
   - "Auto Place on Load" → Enable

3. **Scene Settings:**
   - "World Space" → May help lock position
   - "Camera Space" → Usually what causes movement

---

## Alternative: Convert to Self-Hosted

If you need more control, consider converting to a self-hosted solution (see `volumetric-integration-options.md`). This gives you full control over positioning and placement behavior.

