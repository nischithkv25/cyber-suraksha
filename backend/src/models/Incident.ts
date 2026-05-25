import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  userId: mongoose.Types.ObjectId;
  scamType: string;
  threatSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  description: string;
  smsDelivered: boolean;
  pushDelivered: boolean;
  blockchainHash: string;
  status: 'PENDING_REVIEW' | 'ACTION_TAKEN' | 'FIR_GENERATED';
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scamType: { type: String, required: true },
  threatSeverity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
  confidenceScore: { type: Number, required: true },
  description: { type: String, required: true },
  smsDelivered: { type: Boolean, default: false },
  pushDelivered: { type: Boolean, default: false },
  blockchainHash: { type: String, required: true },
  status: { type: String, enum: ['PENDING_REVIEW', 'ACTION_TAKEN', 'FIR_GENERATED'], default: 'PENDING_REVIEW' }
}, { timestamps: true });

export default mongoose.model<IIncident>('Incident', IncidentSchema);
