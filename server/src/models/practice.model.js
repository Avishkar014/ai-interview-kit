import mongoose from "mongoose";

const practiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kitId: { type: mongoose.Schema.Types.ObjectId, ref: "Kit", required: true },
    flashcardId: { type: String, required: true },
    confidence: Number,
    covered: Boolean,
    lastReviewedAt: Date,
    nextReviewAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Practice || mongoose.model("Practice", practiceSchema);