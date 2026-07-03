import { BRIGHTNESS_THRESHOLD } from "@/config/fallguard";

export function checkBrightness(
  imageData: ImageData
): { average: number; isDim: boolean } {
  const pixels = imageData.data;
  let total = 0;
  const count = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    total += (r + g + b) / 3;
  }

  const average = total / count;
  return {
    average,
    isDim: average < BRIGHTNESS_THRESHOLD,
  };
}

export function getFrameImageData(video: HTMLVideoElement): ImageData | null {
  const canvas = new OffscreenCanvas(video.videoWidth || 320, video.videoHeight || 240);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}