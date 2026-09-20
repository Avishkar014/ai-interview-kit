import axios from "axios";

import { config } from "../config/index.js";

export class LLMError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "LLMError";
    this.code = "LLM_ERROR";
    this.cause = cause;
  }
}

function parseJson(content) {
  const cleaned = String(content || "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    throw new LLMError("LLM returned invalid JSON");
  }
}

export async function requestJson(system, user) {
  if (!config.openaiApiKey) throw new LLMError("OPENAI_API_KEY is not configured");

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }, {
      timeout: 20_000,
      headers: { Authorization: `Bearer ${config.openaiApiKey}`, "Content-Type": "application/json" },
    });

    return parseJson(response.data?.choices?.[0]?.message?.content);
  } catch (error) {
    if (error instanceof LLMError) throw error;
    throw new LLMError("LLM request failed", error);
  }
}