import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import generateKit from "../server/src/services/generation/generateKit.js";
import validateKit from "../server/src/services/validation/validateKit.js";

function parseArgs(argumentsList) {
	const options = {};
	for (let index = 0; index < argumentsList.length; index += 1) {
		if (argumentsList[index].startsWith("--")) options[argumentsList[index].slice(2)] = argumentsList[index + 1];
	}
	if (!options.input || !options.output) throw new Error("Usage: npm run evaluate -- --input cases.json --output kits.json");
	return options;
}

function normalizeCase(input) {
	return { ...input, company: input.company || "", company_url: input.company_url || input.companyUrl || "", role: input.role || input.jobTitle || "", location: input.location || "", jd: input.jd || input.jobDescription || "", days: input.days || input.days_available || 1 };
}

export async function evaluateCases(cases, generator = generateKit, validator = validateKit) {
	const kits = [];
	for (let index = 0; index < cases.length; index += 1) {
		const id = `case-${String(index + 1).padStart(2, "0")}`;
		try {
			const kit = await generator(normalizeCase(cases[index]));
			kits.push({ id, status: "ok", kit: validator(kit), error: null });
		} catch (error) {
			kits.push({ id, status: "failed", kit: null, error: { code: error?.code || "EVALUATION_ERROR", message: error?.message || "Case evaluation failed" } });
		}
	}
	return { version: "1.0", generated_at: new Date().toISOString(), kits };
}

async function readCases(filePath) {
	const parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
	return Array.isArray(parsed) ? parsed : parsed.cases;
}

export async function runEvaluation(inputPath, outputPath) {
	const cases = await readCases(inputPath);
	if (!Array.isArray(cases)) throw new Error("Input JSON must be an array or an object with a cases array");
	const report = await evaluateCases(cases);
	await fs.mkdir(path.dirname(outputPath), { recursive: true });
	await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
	return report;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === pathToFileURL(currentFile).href) {
	try {
		const options = parseArgs(process.argv.slice(2));
		await runEvaluation(path.resolve(options.input), path.resolve(options.output));
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}