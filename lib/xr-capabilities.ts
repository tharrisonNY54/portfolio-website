export interface XrCapabilities {
  isIOS: boolean;
  isAndroid: boolean;
  isQuestBrowser: boolean;
  supportsWebXR: boolean;
  supportsImmersiveAR: boolean;
  supportsImmersiveVR: boolean;
}

export async function detectXrCapabilities(): Promise<XrCapabilities> {
  if (typeof window === "undefined") {
    return {
      isIOS: false,
      isAndroid: false,
      isQuestBrowser: false,
      supportsWebXR: false,
      supportsImmersiveAR: false,
      supportsImmersiveVR: false,
    };
  }

  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isQuestBrowser =
    ua.includes("OculusBrowser") ||
    ua.includes("Quest") ||
    ua.includes("Meta");

  let supportsImmersiveAR = false;
  let supportsImmersiveVR = false;

  if ((navigator as any).xr) {
    try {
      supportsImmersiveAR = await (navigator as any).xr.isSessionSupported("immersive-ar");
    } catch {
      supportsImmersiveAR = false;
    }

    try {
      supportsImmersiveVR = await (navigator as any).xr.isSessionSupported("immersive-vr");
    } catch {
      supportsImmersiveVR = false;
    }
  }

  const supportsWebXR = supportsImmersiveAR || supportsImmersiveVR;

  return {
    isIOS,
    isAndroid,
    isQuestBrowser,
    supportsWebXR,
    supportsImmersiveAR,
    supportsImmersiveVR,
  };
}

