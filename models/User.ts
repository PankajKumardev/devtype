import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  username: string; // Unique username like "pankaj9891"
  email: string;
  image?: string;
  providerId: string;
  stats: {
    testsCompleted: number;
    bestWpm: number;
    avgAccuracy: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, lowercase: true }, // sparse allows null for migration
    email: { type: String, required: true, unique: true },
    image: { type: String },
    providerId: { type: String, required: true },
    stats: {
      testsCompleted: { type: Number, default: 0 },
      bestWpm: { type: Number, default: 0 },
      avgAccuracy: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Helper to generate 100% unique username from name
export function generateUsername(name: string): string {
  // Get first name, remove special chars, lowercase
  const firstName = name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') || 'user';
  // Use last 4 digits of timestamp + 2 random digits = 6 digits total (guaranteed unique)
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(10 + Math.random() * 90); // 2 digits: 10-99
  return `${firstName}${timestamp}${random}`;
}

export const User = models.User || model<IUser>('User', UserSchema);


