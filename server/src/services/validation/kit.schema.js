import { z } from "zod";

const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

const sourceSchema = z.strictObject({
  company: z.string(),
  company_url: z.string(),
  role: z.string(),
  location: z.string(),
  jd_chars: z.number().int().min(0),
  researched_at: z.string(),
  pages_used: z.array(z.string()),
});

const companyBriefSchema = z.strictObject({
  summary: z.string(),
  what_they_do: z.string(),
  sources: z.array(z.string()),
});

const requirementSchema = z.strictObject({
  id: z.string(),
  text: z.string(),
  kind: z.enum(["technical", "behavioural", "domain"]),
  priority: z.enum(["must", "nice"]),
});

const roleSchema = z.strictObject({
  title: z.string(),
  seniority: z.string(),
  responsibilities: z.array(z.string()),
  requirements: z.array(requirementSchema).refine(uniqueIds, "Requirement IDs must be unique"),
});

const questionSchema = z.strictObject({
  id: z.string(),
  requirement_ids: z.array(z.string()),
  category: z.enum(["technical", "behavioural", "system-design", "company-fit"]),
  prompt: z.string(),
  answer_outline: z.string(),
  difficulty: z.number().int().min(1).max(3),
  source: z.enum(["generated", "manual"]).optional(),
  edited: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

const flashcardSchema = z.strictObject({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  requirement_ids: z.array(z.string()),
});

const scheduleSchema = z.strictObject({
  days_available: z.number().int().min(1),
  days: z.array(z.strictObject({
    day: z.number().int(),
    focus: z.string(),
    question_ids: z.array(z.string()),
    minutes: z.number().int(),
  })),
});

const coverageSchema = z.strictObject({
  uncovered_requirement_ids: z.array(z.string()),
  passes: z.number().int().min(0),
});

export const kitSchema = z.strictObject({
  source: sourceSchema,
  company_brief: companyBriefSchema,
  role: roleSchema,
  questions: z.array(questionSchema).refine(uniqueIds, "Question IDs must be unique"),
  flashcards: z.array(flashcardSchema).refine(uniqueIds, "Flashcard IDs must be unique"),
  schedule: scheduleSchema,
  coverage: coverageSchema,
}).superRefine((kit, context) => {
  const requirementIds = new Set(kit.role.requirements.map((requirement) => requirement.id));
  const questionIds = new Set(kit.questions.map((question) => question.id));

  kit.questions.forEach((question, index) => {
    question.requirement_ids.forEach((id) => {
      if (!requirementIds.has(id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["questions", index, "requirement_ids"], message: `Unknown requirement ID: ${id}` });
      }
    });
  });

  kit.flashcards.forEach((flashcard, index) => {
    flashcard.requirement_ids.forEach((id) => {
      if (!requirementIds.has(id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["flashcards", index, "requirement_ids"], message: `Unknown requirement ID: ${id}` });
      }
    });
  });

  kit.schedule.days.forEach((day, index) => {
    day.question_ids.forEach((id) => {
      if (!questionIds.has(id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["schedule", "days", index, "question_ids"], message: `Unknown question ID: ${id}` });
      }
    });
  });
});

export function validateKit(input) {
  return kitSchema.safeParse(input);
}