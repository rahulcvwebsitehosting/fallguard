import {
  HEURISTIC_HEAD_DROP_THRESHOLD,
  HEURISTIC_ANGLE_THRESHOLD,
  HEURISTIC_HIP_KNEE_RATIO,
  FPS,
} from "@/config/fallguard";
import { type KeypointWithScore } from "@/lib/pose-detector";

const BUFFER_SIZE = 5;

interface FrameRecord {
  keypoints: KeypointWithScore[];
  timestamp: number;
}

const frameBuffer: FrameRecord[] = [];
// eslint-disable-next-line prefer-const
let frameHeight = 0;
// eslint-disable-next-line prefer-const
let frameWidth = 0;

function findKeypoint(keypoints: KeypointWithScore[], name: string): KeypointWithScore | null {
  return keypoints.find((kp) => kp.name === name && kp.score > 0.3) ?? null;
}

function angleBetweenThreePoints(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
  const ab = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  const bc = Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2);
  const ac = Math.sqrt((c.x - a.x) ** 2 + (c.y - a.y) ** 2);
  if (ab === 0 || bc === 0) return 180;
  const cosAngle = (ab * ab + bc * bc - ac * ac) / (2 * ab * bc);
  return (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;
}

export function evaluateFall(keypoints: KeypointWithScore[], height: number, width: number): {
  possibleFall: boolean;
  confidence: number;
} {
  frameHeight = height;
  frameWidth = width;

  const record: FrameRecord = { keypoints, timestamp: Date.now() };
  frameBuffer.push(record);
  while (frameBuffer.length > BUFFER_SIZE) {
    frameBuffer.shift();
  }

  const head = findKeypoint(keypoints, "nose");
  const leftShoulder = findKeypoint(keypoints, "left_shoulder");
  const leftHip = findKeypoint(keypoints, "left_hip");
  const leftKnee = findKeypoint(keypoints, "left_knee");
  const leftAnkle = findKeypoint(keypoints, "left_ankle");

  let triggeredChecks = 0;
  let confidence = 0;

  if (head && frameBuffer.length >= 2) {
    const prev = frameBuffer[frameBuffer.length - 2];
    const prevHead = findKeypoint(prev.keypoints, "nose");
    if (prevHead) {
      const dropDelta = head.y - prevHead.y;
      const dropPercent = dropDelta / frameHeight;
      if (dropPercent > HEURISTIC_HEAD_DROP_THRESHOLD) {
        triggeredChecks++;
        confidence += Math.min(dropPercent / HEURISTIC_HEAD_DROP_THRESHOLD, 2);
      }
    }
  }

  if (leftHip && leftKnee) {
    const ratio = leftHip.y / Math.max(leftKnee.y, 1);
    if (ratio > HEURISTIC_HIP_KNEE_RATIO) {
      triggeredChecks++;
      confidence += (ratio - HEURISTIC_HIP_KNEE_RATIO) * 2;
    }
  }

  if (leftShoulder && leftHip && leftAnkle) {
    const angle = angleBetweenThreePoints(
      { x: leftShoulder.x, y: leftShoulder.y },
      { x: leftHip.x, y: leftHip.y },
      { x: leftAnkle.x, y: leftAnkle.y }
    );
    if (angle < HEURISTIC_ANGLE_THRESHOLD) {
      triggeredChecks++;
      confidence += (HEURISTIC_ANGLE_THRESHOLD - angle) / HEURISTIC_ANGLE_THRESHOLD;
    }
  }

  confidence = Math.min(confidence, 1);
  const possibleFall = triggeredChecks >= 2 || confidence > 0.7;

  return { possibleFall, confidence };
}

export function clearHeuristicBuffer(): void {
  frameBuffer.length = 0;
}