import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  contactId: string;
  deviceId: string;
  name: string;
  phone: string;
  relationship: string;
  isHospital: boolean;
  priority: number;
}

const ContactSchema = new Schema<IContact>(
  {
    contactId: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, default: "" },
    isHospital: { type: Boolean, default: false },
    priority: { type: Number, default: 1 },
  },
  {
    timestamps: false,
  }
);

export default mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);