import mongoose, { Schema, Document } from "mongoose";

export interface IDevice extends Document {
  deviceId: string;
  nickname: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  language: "en" | "ta";
  pin: string;
  secretHash: string;
  createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "" },
    },
    language: { type: String, enum: ["en", "ta"], default: "en" },
    pin: { type: String, required: true },
    secretHash: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.Device || mongoose.model<IDevice>("Device", DeviceSchema);