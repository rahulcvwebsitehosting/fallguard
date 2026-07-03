export const MonitoringState = {
  IDLE: 'IDLE',
  CAMERA_STARTING: 'CAMERA_STARTING',
  WARMING_UP: 'WARMING_UP',
  MONITORING: 'MONITORING',
  POSSIBLE_FALL: 'POSSIBLE_FALL',
  VERIFYING: 'VERIFYING',
  COUNTDOWN: 'COUNTDOWN',
  DISPATCHING: 'DISPATCHING',
  SUCCESS: 'SUCCESS',
  COOLDOWN: 'COOLDOWN',
  ERROR: 'ERROR',
} as const;

export type MonitoringState = (typeof MonitoringState)[keyof typeof MonitoringState];

export interface Device {
  deviceId: string;
  nickname: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  language: 'en' | 'ta';
  pin: string;
  secretHash: string;
  createdAt: Date;
}

export interface Contact {
  contactId: string;
  deviceId: string;
  name: string;
  phone: string;
  relationship: string;
  isHospital: boolean;
  priority: number;
}

export type GeminiClassification = 'FALLEN' | 'SITTING' | 'BENDING' | 'STANDING' | 'UNKNOWN';

export interface FallEvent {
  eventId: string;
  deviceId: string;
  timestamp: Date;
  snapshotUrl: string;
  heuristicTriggered: boolean;
  geminiClassification: GeminiClassification;
  cancelled: boolean;
  alertSent: boolean;
  smsStatus: 'sent' | 'failed' | 'pending';
  whatsappStatus: 'sent' | 'failed' | 'pending';
  gpsLocation: {
    lat: number;
    lng: number;
  };
  retryCount: number;
}

export interface AlertPayload {
  deviceId: string;
  message: string;
  contacts: Contact[];
  gps: { lat: number; lng: number };
  timestamp: Date;
}

export interface SetupConfig {
  deviceId: string;
  secret: string;
  nickname: string;
  language: 'en' | 'ta';
  location: { lat: number; lng: number; address: string };
  pin: string;
}

export interface SubHookOutputs {
  camera: { stream: MediaStream | null; error: string | null; isActive: boolean };
  poseDetection: { keypoints: unknown[] | null; isReady: boolean; error: Error | null };
  fallDetection: { possibleFall: boolean; confidence: number };
  countdown: { secondsLeft: number; start: () => void; cancel: () => void; isCancelled: boolean };
  alertPipeline: { status: 'dispatching' | 'sent' | 'failed' | 'queued' };
}