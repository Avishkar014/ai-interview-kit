import { z } from "zod";
import mongoose from "mongoose";

import Kit from "../models/kit.model.js";
import Practice from "../models/practice.model.js";
import generateKit from "../services/generation/generateKit.js";
import aggregateWeakSpots from "../services/practice/weakSpots.js";

const createKitSchema = z.object({
  company_url: z.string().url(),
  company: z.string().optional().default(""),
  role: z.string().min(1),
  location: z.string().min(1),
  jd: z.string().min(1),
  days: z.coerce.number().int().min(1).max(365),
});

function safeError(error) {
  if (error?.code === "KIT_GENERATION_ERROR" && error.message) return error.message;
  if (error?.code === "LLM_ERROR" && error.message) return error.message;
  return "Kit generation failed";
}

function ownerQuery(request, id) {
  return { _id: id, userId: request.user.id };
}

export async function createKit(request, response) {
  const parsed = createKitSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ success: false, message: "Invalid kit input", errors: parsed.error.flatten().fieldErrors });

  const kit = await Kit.create({
    userId: request.user.id,
    status: "processing",
    generationProgress: { stage: "queued", progress: 0, message: "Kit generation queued" },
  });

  void generateKit(parsed.data, async (progress) => {
    await Kit.updateOne({ _id: kit._id, userId: request.user.id }, { $set: { generationProgress: progress } });
  }).then(async (generatedKit) => {
    await Kit.updateOne({ _id: kit._id, userId: request.user.id }, { $set: { ...generatedKit, status: "completed", generationProgress: { stage: "completed", progress: 100, message: "Interview kit ready" } } });
  }).catch(async (error) => {
    await Kit.updateOne({ _id: kit._id, userId: request.user.id }, { $set: { status: "failed", generationError: safeError(error), generationProgress: { stage: "failed", progress: 100, message: safeError(error) } } });
  });

  return response.status(202).json({ kitId: kit._id.toString(), status: "processing" });
}

export async function listKits(request, response) {
  const kits = await Kit.find({ userId: request.user.id }).sort({ updatedAt: -1 }).select("-__v");
  return response.json({ success: true, kits });
}

export async function getKitStatus(request, response) {
  const kit = await Kit.findOne(ownerQuery(request, request.params.id)).select("status generationProgress generationError");
  if (!kit) return response.status(404).json({ success: false, message: "Kit not found" });
  return response.json({ kitId: kit._id.toString(), status: kit.status, generationProgress: kit.generationProgress, error: kit.generationError });
}

export async function getKit(request, response) {
  const kit = await Kit.findOne(ownerQuery(request, request.params.id)).select("-__v");
  if (!kit) return response.status(404).json({ success: false, message: "Kit not found" });
  return response.json({ success: true, kit });
}

export async function getWeakSpots(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: "Invalid kit ID" });
  const kit = await Kit.findOne(ownerQuery(request, request.params.id)).select("questions flashcards role");
  if (!kit) return response.status(404).json({ success: false, message: "Kit not found" });
  const practiceRecords = await Practice.find({ userId: request.user.id, kitId: request.params.id });
  return response.json({ success: true, ...aggregateWeakSpots({ kit, practiceRecords }) });
}

export async function updateKit(request, response) {
  const questions = z.array(z.object({
    id: z.string(), requirement_ids: z.array(z.string()), category: z.enum(["technical", "behavioural", "system-design", "company-fit"]), prompt: z.string(), answer_outline: z.string(), difficulty: z.number().int().min(1).max(3), source: z.enum(["generated", "manual"]).optional(), edited: z.boolean().optional(), pinned: z.boolean().optional(),
  })).safeParse(request.body.questions);
  if (!questions.success) return response.status(400).json({ success: false, message: "Invalid questions" });
  const kit = await Kit.findOneAndUpdate(ownerQuery(request, request.params.id), { $set: { questions: questions.data } }, { new: true }).select("-__v");
  if (!kit) return response.status(404).json({ success: false, message: "Kit not found" });
  return response.json({ success: true, kit });
}

export async function deleteKit(request, response) {
  const result = await Kit.deleteOne(ownerQuery(request, request.params.id));
  if (!result.deletedCount) return response.status(404).json({ success: false, message: "Kit not found" });
  return response.status(204).send();
}

export { createKitSchema };