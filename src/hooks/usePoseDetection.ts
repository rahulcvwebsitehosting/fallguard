"use client";

import { useState, useEffect, useRef } from "react";
import {
  initPoseDetector,
  detectPose,
  disposePoseDetector,
  type KeypointWithScore,
} from "@/lib/pose-detector";
import { FPS } from "@/config/fallguard";
import { warn } from "@/lib/logger";
import type * as poseDetection from "@tensorflow-models/pose-detection";

export interface UsePoseDetectionResult {
  keypoints: KeypointWithScore[] | null;
  isReady: boolean;
  error: Error | null;
}

export function usePoseDetection(stream: MediaStream | null): UsePoseDetectionResult {
  const [keypoints, setKeypoints] = useState<KeypointWithScore[] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const throttleRef = useRef(0);

  useEffect(() => {
    if (!stream) return;

    const video = document.createElement("video");
    video.srcObject = stream;
    video.playsInline = true;
    video.muted = true;
    videoRef.current = video;

    video.play().then(() => {
      initPoseDetector()
        .then((det) => {
          detectorRef.current = det;
          setIsReady(true);
          const intervalMs = Math.round(1000 / FPS);
          frameIntervalRef.current = window.setInterval(() => {
            throttleRef.current++;
            if (throttleRef.current % 3 !== 0) return;
            detectPose(video, det)
              .then((result) => {
                if (result) {
                  setKeypoints(result.keypoints);
                }
              })
              .catch(() => {
                // skip frame
              });
          }, intervalMs);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error("Failed to load pose detector"));
          warn("Pose detector initialization failed", { error: String(err) });
        });
    });

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      video.pause();
      video.srcObject = null;
      disposePoseDetector();
      detectorRef.current = null;
      setIsReady(false);
    };
  }, [stream]);

  return { keypoints, isReady, error };
}