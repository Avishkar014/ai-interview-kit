import { jest } from "@jest/globals";
import { retry } from "../src/utils/retry.js";

describe("retry utility", () => {
  test("retries transient failures and succeeds", async () => {
    const operation = jest.fn().mockRejectedValueOnce({ response: { status: 429 } }).mockRejectedValueOnce({ response: { status: 503 } }).mockResolvedValue("ok");
    await expect(retry(operation, { sleep: async () => {} })).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  test("does not retry permanent failures", async () => {
    const operation = jest.fn().mockRejectedValue({ response: { status: 404 } });
    await expect(retry(operation, { sleep: async () => {} })).rejects.toEqual({ response: { status: 404 } });
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test("stops after three attempts", async () => {
    const operation = jest.fn().mockRejectedValue({ response: { status: 500 } });
    await expect(retry(operation, { sleep: async () => {} })).rejects.toEqual({ response: { status: 500 } });
    expect(operation).toHaveBeenCalledTimes(3);
  });
});