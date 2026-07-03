"use client";

import { useRef, useEffect } from "react";
import { type KeypointWithScore } from "@/lib/pose-detector";

const CONNECTIONS: [string, string][] = [
  ["nose", "left_eye"],
  ["nose", "right_eye"],
  ["left_eye", "left_ear"],
  ["right_eye", "right_ear"],
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["right_shoulder", "right_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
  ["left_knee", "left_ankle"],
  ["right_knee", "right_ankle"],
];

interface PoseOverlayProps {
  keypoints: KeypointWithScore[] | null;
  visible: boolean;
}

export default function PoseOverlay({ keypoints, visible }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!visible || !keypoints) return;

    const kpMap = new Map<string, { x: number; y: number }>();
    for (const kp of keypoints) {
      if (kp.score > 0.3) {
        kpMap.set(kp.name, { x: kp.x, y: kp.y });
      }
    }

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#22c55e";

    for (const [from, to] of CONNECTIONS) {
      const p1 = kpMap.get(from);
      const p2 = kpMap.get(to);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    for (const [, pos] of kpMap) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [keypoints, visible]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    />
  );
}