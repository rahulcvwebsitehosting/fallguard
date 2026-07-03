import mongoose, { Schema, Document } from "mongoose";

export interface IFallEvent extends Document {
  eventId: string;
  deviceId: string;
  timestamp: Date;
  snapshotUrl: string;
  heuristicTriggered: boolean;
  geminiClassification: "FALLEN" | "SITTING" | "BENDING" | "STANDING" | "UNKNOWN";
  cancelled: boolean;
  alertSent: boolean;
  smsStatus: "sent" | "failed" | "pending";
  whatsappStatus: "sent" | "failed" | "pending";
  gpsLocation: {
    lat: number;
    lng: number;
  };
  retryCount: number;
}

const FallEventSchema = new Schema<IFallEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, default: Date.now },
    snapshotUrl: { type: String, default: "" },
    heuristicTriggered: { type: Boolean, default: false },
    geminiClassification: {
      type: String,
      enum: ["FALLEN", "SITTING", "BENDING", "STANDING", "UNKNOWN"],
      default: "UNKNOWN",
    },
    cancelled: { type: Boolean, default: false },
    alertSent: { type: Boolean, default: false },
    smsStatus: { type: String, enum: ["sent", "failed", "pending"], default: "pending" },
    whatsappStatus: { type: String, enum: ["sent", "failed", "pending"], default: "pending" },
    gpsLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    retryCount: { type: Number, default: 0 },
  },
  {
    timestamps: false,
  }
);

FallEventSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.models.FallEvent || mongoose.model<IFallEvent>("FallEvent", FallEventSchema);