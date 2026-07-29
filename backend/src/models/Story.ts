import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  authorName: string;
  commentText: string;
  createdAt: Date;
}

export interface IStory extends Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  scamType: string;
  financialLoss?: number;
  authorName: string;
  isAnonymous: boolean;
  likes: number;
  likedBy: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  authorName: { type: String, default: 'Anonymous Citizen' },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const StorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  scamType: { type: String, required: true },
  financialLoss: { type: Number, default: 0 },
  authorName: { type: String, default: 'Anonymous Citizen' },
  isAnonymous: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: { type: [CommentSchema], default: [] }
}, { timestamps: true });

export default mongoose.model<IStory>('Story', StorySchema);
