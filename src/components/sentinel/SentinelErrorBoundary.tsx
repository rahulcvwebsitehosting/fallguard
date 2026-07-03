"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class SentinelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    const msg = error.message?.includes("WebGL")
      ? "Pose detection requires WebGL. This browser may not support it. Try Chrome on Android."
      : error.message?.includes("camera") || error.message?.includes("getUserMedia")
        ? "Camera monitoring unavailable. Please try a different phone or browser."
        : "An unexpected error occurred. Please restart the app.";
    return { hasError: true, errorMessage: msg };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-8 text-white">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h1 className="text-2xl font-bold text-red-500">Monitoring Unavailable</h1>
            <p className="text-lg text-gray-300">{this.state.errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white hover:bg-green-700"
            >
              Restart
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}