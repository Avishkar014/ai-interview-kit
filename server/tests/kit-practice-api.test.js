import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "api-test-secret";

const kit = { _id: { toString: () => "kit-1" }, userId: "user-1", status: "processing", generationProgress: { stage: "generating_questions", progress: 55 }, flashcards: [{ id: "f1", front: "Front", back: "Back" }] };
const findOneQuery = (value) => ({ select: async () => value, then: (resolve, reject) => Promise.resolve(value).then(resolve, reject) });
const Kit = {
  create: jest.fn(async (input) => ({ ...kit, ...input })),
  updateOne: jest.fn(async () => ({ acknowledged: true })),
  find: jest.fn(() => ({ sort: () => ({ select: async () => [kit] }) })),
  findOne: jest.fn(() => findOneQuery(kit)),
  findOneAndUpdate: jest.fn(async () => kit),
  deleteOne: jest.fn(async () => ({ deletedCount: 1 })),
};
const Practice = {
  findOneAndUpdate: jest.fn(async (_filter, update) => ({ ...update.$set, flashcardId: "f1" })),
  find: jest.fn(async () => []),
};
const generateKit = jest.fn(async (_input, progress) => {
  await progress({ stage: "generating_questions", progress: 55, message: "Generating interview questions" });
  return { source: {}, company_brief: {}, role: {}, questions: [], flashcards: [], schedule: {}, coverage: {} };
});

jest.unstable_mockModule("../src/models/user.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../src/models/kit.model.js", () => ({ default: Kit }));
jest.unstable_mockModule("../src/models/practice.model.js", () => ({ default: Practice }));
jest.unstable_mockModule("../src/services/generation/generateKit.js", () => ({ default: generateKit }));

const { default: app } = await import("../src/app.js");
const tokenFor = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

describe("kit and practice API ownership", () => {
  beforeEach(() => { Kit.findOne.mockImplementation(() => findOneQuery(kit)); Kit.updateOne.mockClear(); generateKit.mockClear(); });

  test("rejects unauthenticated kit requests", async () => {
    expect((await request(app).get("/api/kits")).status).toBe(401);
  });

  test("creates a processing kit and records progress updates", async () => {
    const response = await request(app).post("/api/kits").set("Cookie", `token=${tokenFor("user-1")}`).send({ company_url: "https://example.com", role: "Engineer", location: "Remote", jd: "A detailed job description for testing.", days: 10 });
    expect(response.status).toBe(202);
    expect(response.body.status).toBe("processing");
    expect(generateKit).toHaveBeenCalled();
    expect(Kit.updateOne).toHaveBeenCalled();
  });

  test("returns status only for the authenticated owner", async () => {
    const response = await request(app).get("/api/kits/kit-1/status").set("Cookie", `token=${tokenFor("user-1")}`);
    expect(response.status).toBe(200);
    expect(response.body.generationProgress.progress).toBe(55);
    Kit.findOne.mockImplementationOnce(() => findOneQuery(null));
    expect((await request(app).get("/api/kits/other/status").set("Cookie", `token=${tokenFor("user-2")}`)).status).toBe(404);
  });

  test("practice requires ownership and persists confidence", async () => {
    const response = await request(app).post("/api/practice/kit-1").set("Cookie", `token=${tokenFor("user-1")}`).send({ flashcardId: "f1", confidence: 4, covered: true });
    expect(response.status).toBe(200);
    expect(Practice.findOneAndUpdate).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", kitId: "kit-1", flashcardId: "f1" }), expect.anything(), expect.objectContaining({ upsert: true }));
    Kit.findOne.mockImplementationOnce(() => findOneQuery(null));
    const otherUserResponse = await request(app).post("/api/practice/kit-1").set("Cookie", `token=${tokenFor("user-2")}`).send({ flashcardId: "f1", confidence: 4, covered: true });
    expect(otherUserResponse.status).toBe(404);
  });
});