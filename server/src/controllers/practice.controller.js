import { z } from "zod";

import Kit from "../models/kit.model.js";
import Practice from "../models/practice.model.js";

const practiceInputSchema = z.object({
  flashcardId: z.string().min(1),
  confidence: z.number().int().min(1).max(5),
  covered: z.boolean(),
});

async function ownedKit(request, kitId) {
  return Kit.findOne({ _id: kitId, userId: request.user.id });
}

export async function startPractice(request, response) {
  const parsed = practiceInputSchema.extend({ kitId: z.string().min(1) }).safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ success: false, message: "Invalid practice input" });
  const kit = await ownedKit(request, parsed.data.kitId);
  if (!kit) return response.status(404).json({ success: false, message: "Kit not found" });
  const flashcard = kit.flashcards?.find((card) => card.id === parsed.data.flashcardId);
  if (!flashcard) return response.status(404).json({ success: false, message: "Flashcard not found" });
  return savePracticeRecord(request, response, parsed.data.kitId, parsed.data);
}

export async function savePractice(request, response) {
  const parsed = practiceInputSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ success: false, message: "Invalid practice input" });
  const kit = await ownedKit(request, request.params.kitId);
  if (!kit) return response.status(404).json({ success: false, message: "Kit not found" });
  if (!kit.flashcards?.some((card) => card.id === parsed.data.flashcardId)) return response.status(404).json({ success: false, message: "Flashcard not found" });
  return savePracticeRecord(request, response, request.params.kitId, parsed.data);
}

async function savePracticeRecord(request, response, kitId, input) {
  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + (6 - input.confidence) * 24 * 60 * 60 * 1000);
  const practice = await Practice.findOneAndUpdate(
    { userId: request.user.id, kitId, flashcardId: input.flashcardId },
    { $set: { confidence: input.confidence, covered: input.covered, lastReviewedAt: now, nextReviewAt } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return response.status(200).json({ success: true, practice });
}

export async function getPractice(request, response) {
  const kit = await ownedKit(request, request.params.kitId);
  if (!kit) return response.status(404).json({ success: false, message: "Kit not found" });
  const records = await Practice.find({ userId: request.user.id, kitId: request.params.kitId });
  const recordByCard = new Map(records.map((record) => [record.flashcardId, record]));
  const flashcards = (kit.flashcards || []).map((flashcard) => ({ ...flashcard, practice: recordByCard.get(flashcard.id) || null }));
  flashcards.sort((left, right) => (6 - (left.practice?.confidence || 0)) - (6 - (right.practice?.confidence || 0)) || (left.practice ? 1 : -1));
  return response.json({ success: true, flashcards });
}