import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  userId: mongoose.Types.ObjectId;
  incidentType: string;
  description: string;
  dateOfIncident: Date;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'CLOSED';
  financialLoss: number;
  aiSummary?: string;
  pdfReportUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  incidentType: { type: String, required: true },
  description: { type: String, required: true },
  dateOfIncident: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'ACTION_TAKEN', 'CLOSED'], default: 'PENDING' },
  financialLoss: { type: Number, default: 0 },
  aiSummary: { type: String },
  pdfReportUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
