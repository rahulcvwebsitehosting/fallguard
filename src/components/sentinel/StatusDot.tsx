"use client";

import { cn } from "@/lib/utils";
import { type MonitoringState as MonitoringStateType } from "@/types";
import { MonitoringState } from "@/types";

interface StatusDotProps {
  state: MonitoringStateType;
  className?: string;
}

function getColor(state: MonitoringStateType): string {
  switch (state) {
    case MonitoringState.IDLE:
      return "bg-gray-400";
    case MonitoringState.CAMERA_STARTING:
    case MonitoringState.WARMING_UP:
      return "bg-blue-500";
    case MonitoringState.MONITORING:
      return "bg-green-500";
    case MonitoringState.POSSIBLE_FALL:
    case MonitoringState.VERIFYING:
      return "bg-yellow-500";
    case MonitoringState.COUNTDOWN:
    case MonitoringState.DISPATCHING:
      return "bg-red-500";
    case MonitoringState.SUCCESS:
      return "bg-green-400";
    case MonitoringState.COOLDOWN:
    case MonitoringState.ERROR:
      return "bg-orange-500";
    default:
      return "bg-gray-400";
  }
}

function isPulsing(state: MonitoringStateType): boolean {
  return (
    state === MonitoringState.MONITORING ||
    state === MonitoringState.CAMERA_STARTING ||
    state === MonitoringState.WARMING_UP
  );
}

function isFlashing(state: MonitoringStateType): boolean {
  return (
    state === MonitoringState.COUNTDOWN ||
    state === MonitoringState.VERIFYING ||
    state === MonitoringState.POSSIBLE_FALL
  );
}

export default function StatusDot({ state, className }: StatusDotProps) {
  const color = getColor(state);
  const pulse = isPulsing(state);
  const flash = isFlashing(state);

  return (
    <div className={cn("absolute left-4 top-4 z-20", className)}>
      <div
        className={cn(
          "h-5 w-5 rounded-full border-2 border-white/50 shadow-lg",
          color,
          pulse && "animate-pulse",
          flash && "animate-pulse"
        )}
      />
    </div>
  );
}