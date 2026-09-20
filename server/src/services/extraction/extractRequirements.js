import { z } from "zod";

import { LLMError, requestJson } from "../llm.js";

const extractionSchema = z.strictObject({
  title: z.string().min(1),
  seniority: z.string().min(1),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.strictObject({
    text: z.string().min(1),
    kind: z.enum(["technical", "behavioural", "domain"]),
    priority: z.enum(["must", "nice"]),
  })),
});

export default async function extractRequirements(jobDescription) {
  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    throw new LLMError("A non-empty job description is required");
  }

  const result = await requestJson(
    "Extract only the requested job description fields. Return JSON with title, seniority, responsibilities, and requirements. Each requirement must have text, kind (technical, behavioural, or domain), and priority (must for required or must-have language, nice only for preferred, desired, or nice-to-have language). Do not generate interview questions or any other fields. Do not add IDs.",
    jobDescription,
  );

  const parsed = extractionSchema.safeParse(result);
  if (!parsed.success) throw new LLMError("LLM returned invalid requirement data", parsed.error);

  return {
    title: parsed.data.title,
    seniority: parsed.data.seniority,
    responsibilities: parsed.data.responsibilities,
    requirements: parsed.data.requirements.map((requirement, index) => ({ id: `r${index + 1}`, ...requirement })),
  };
}

export { extractionSchema };