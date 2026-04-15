"use client";

import { useEffect, useRef } from "react";
import type { FacialArea } from "@/lib/types";

type SourceFaceCropProps = {
  imageUrl: string;
  area: FacialArea;
  /** Max width/height of the displayed crop (preserves aspect). */
  maxDisplay?: number;
  className?: string;
};

/**
 * Renders the given rectangular region of the source image onto a canvas (client-side crop).
 */
export function SourceFaceCrop({
  imageUrl,
  area,
  maxDisplay = 140,
  className = "",
}: SourceFaceCropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      let { x, y, w, h } = area;
      x = Math.max(0, Math.floor(x));
      y = Math.max(0, Math.floor(y));
      w = Math.floor(w);
      h = Math.floor(h);
      w = Math.min(w, img.naturalWidth - x);
      h = Math.min(h, img.naturalHeight - y);
      if (w <= 0 || h <= 0) return;

      const scale = Math.min(1, maxDisplay / Math.max(w, h));
      const dw = Math.max(1, Math.round(w * scale));
      const dh = Math.max(1, Math.round(h * scale));
      canvas.width = dw;
      canvas.height = dh;
      ctx.drawImage(img, x, y, w, h, 0, 0, dw, dh);
    };
    img.onerror = () => {
      /* leave canvas blank */
    };
    img.src = imageUrl;
  }, [imageUrl, area.x, area.y, area.w, area.h, maxDisplay]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
