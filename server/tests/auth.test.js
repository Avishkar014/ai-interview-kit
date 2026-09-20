import request from "supertest";
import { jest } from "@jest/globals";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const users = new Map();

jest.unstable_mockModule("../src/models/user.model.js", () => ({
  default: {
    findOne: jest.fn(async ({ email }) => users.get(email) || null),
    create: jest.fn(async (data) => {
      const user = { _id: "user-1", ...data, createdAt: new Date("2026-09-20T00:00:00.000Z") };
      users.set(user.email, user);
      return user;
    }),
    findById: jest.fn(async (id) => [...users.values()].find((user) => user._id === id) || null),
  },
}));

const { default: app } = await import("../src/app.js");

describe("authentication flows", () => {
  test("register, login, me, and logout work with an HTTP-only cookie", async () => {
    const agent = request.agent(app);

    const registerResponse = await agent.post("/api/auth/register").send({ email: "candidate@example.com", password: "password123" });
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.passwordHash).toBeUndefined();
    expect(registerResponse.headers["set-cookie"][0]).toContain("HttpOnly");

    const meResponse = await agent.get("/api/auth/me");
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe("candidate@example.com");
    expect(meResponse.body.user.passwordHash).toBeUndefined();

    const loginResponse = await agent.post("/api/auth/login").send({ email: "candidate@example.com", password: "password123" });
    expect(loginResponse.status).toBe(200);

    const logoutResponse = await agent.post("/api/auth/logout");
    expect(logoutResponse.status).toBe(200);

    const afterLogoutResponse = await agent.get("/api/auth/me");
    expect(afterLogoutResponse.status).toBe(401);
  });
});