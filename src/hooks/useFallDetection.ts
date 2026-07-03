"use client";

import { useState, useEffect, useRef } from "react";
import { evaluateFall, clearHeuristicBuffer } from "@/lib/heuristics";
import { type KeypointWithScore } from "@/lib/pose-detector";

export interface UseFallDetectionResult {
  possibleFall: boolean;
  confidence: number;
}

export function useFallDetection(keypoints: KeypointWithScore[] | null): UseFallDetectionResult {
  const [result, setResult] = useState<UseFallDetectionResult>({
    possibleFall: false,
    confidence: 0,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!keypoints) return;

    const height = videoRef.current?.videoHeight || 480;
    const width = videoRef.current?.videoWidth || 640;
    const evaluation = evaluateFall(keypoints, height, width);
    setResult(evaluation);
  }, [keypoints]);

  useEffect(() => {
    return () => clearHeuristicBuffer();
  }, []);

  return result;
}