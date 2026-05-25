import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  complaintId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileType: string;
  blockchainHash?: string;
  ocrExtractedText?: string;
  threatScore?: number;
  uploadedAt: Date;
}

const EvidenceSchema: Schema = new Schema({
  complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  blockchainHash: { type: String },
  ocrExtractedText: { type: String },
  threatScore: { type: Number }
}, { timestamps: true });

export default mongoose.model<IEvidence>('Evidence', EvidenceSchema);
