import mongoose from "mongoose";

const kitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: mongoose.Schema.Types.Mixed,
    company_brief: mongoose.Schema.Types.Mixed,
    role: mongoose.Schema.Types.Mixed,
    questions: mongoose.Schema.Types.Mixed,
    flashcards: mongoose.Schema.Types.Mixed,
    schedule: mongoose.Schema.Types.Mixed,
    coverage: mongoose.Schema.Types.Mixed,
    status: String,
    generationProgress: mongoose.Schema.Types.Mixed,
    generationError: String,
  },
  { timestamps: true }
);

export default mongoose.models.Kit || mongoose.model("Kit", kitSchema);