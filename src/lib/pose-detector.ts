import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { FPS, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT } from "@/config/fallguard";
import { info, warn, error as logError } from "@/lib/logger";

let detector: poseDetection.PoseDetector | null = null;

export interface KeypointWithScore {
  x: number;
  y: number;
  score: number;
  name: string;
}

export async function initPoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detector) return detector;

  await tf.setBackend("webgl");
  await tf.ready();
  info("TensorFlow.js backend initialized", { backend: tf.getBackend() });

  const model = poseDetection.SupportedModels.MoveNet;
  detector = await poseDetection.createDetector(model, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  });
  info("MoveNet model loaded");

  await warmUp(detector);
  info("MoveNet warm-up complete");

  return detector;
}

async function warmUp(det: poseDetection.PoseDetector): Promise<void> {
  const canvas = new OffscreenCanvas(SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT);
  await det.estimatePoses(canvas as unknown as HTMLCanvasElement, {
    flipHorizontal: false,
  });
}

export async function detectPose(
  video: HTMLVideoElement,
  det: poseDetection.PoseDetector
): Promise<{ keypoints: KeypointWithScore[]; score: number } | null> {
  try {
    const poses = await det.estimatePoses(video, {
      flipHorizontal: false,
    });
    if (!poses || poses.length === 0) return null;

    const pose = poses[0];
    const keypoints: KeypointWithScore[] = pose.keypoints.map((kp: poseDetection.Keypoint) => ({
      x: kp.x,
      y: kp.y,
      score: kp.score ?? 0,
      name: kp.name ?? "unknown",
    }));

    return { keypoints, score: pose.score ?? 0 };
  } catch (err) {
    warn("Pose detection failed", { error: String(err) });
    return null;
  }
}

export function disposePoseDetector(): void {
  if (detector) {
    detector.dispose();
    detector = null;
    info("Pose detector disposed");
  }
}