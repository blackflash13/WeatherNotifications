import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  email: string;
  city: string;
  frequency: "hourly" | "daily";
  confirmed: boolean;
  token: string;
  active: boolean;
  created: Date;
  updated: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ["hourly", "daily"],
      default: "daily",
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "updated",
    },
  }
);

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
