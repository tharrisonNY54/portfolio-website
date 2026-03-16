"use client";

import dynamic from "next/dynamic";

const HologramPlayer = dynamic(() => import("@/components/HologramPlayer"), {
  ssr: false,
});

export interface HologramPlayerWrapperProps {
  videoUrl: string;
  fallbackVideoUrl?: string;
}

export default function HologramPlayerWrapper(props: HologramPlayerWrapperProps) {
  return <HologramPlayer {...props} />;
}
