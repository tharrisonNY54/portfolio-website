/**
 * Global type declarations for browser and 8th Wall globals
 */
export {};

declare global {
  interface Window {
    _reactSelectedVideoUrl?: string;
    __XR_VIEWER_ALREADY_LOADED__?: boolean;
    __NORMAL_VIEWER_ALREADY_LOADED__?: boolean;
    inputs?: {
      videoUrl?: string;
      bytesUrl?: string;
      slidesUrl?: string;
      cropSeconds?: number;
      image?: string;
      imageOrientation?: string;
      regularImages?: string[];
      images360?: string[];
      videoUrls?: string[];
      bytesUrls?: string[];
    };
    sharedState?: {
      hologramPlaced?: boolean;
      tileRenderer?: unknown;
      video?: HTMLVideoElement | null;
      scene?: unknown;
    };
    placegroundScenePipelineModule?: () => unknown;
    showVideoModule?: () => unknown;
  }
}
