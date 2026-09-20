const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function isRetryableError(error) {
  const status = error?.response?.status ?? error?.status;
  if (RETRYABLE_STATUS_CODES.has(status)) return true;
  return error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT" || error?.code === "ECONNRESET" || error?.code === "ENOTFOUND" || error?.code === "EAI_AGAIN" || error?.isAxiosError === true && !error.response;
}

function retryAfterDelay(error) {
  const header = error?.response?.headers?.["retry-after"];
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0 && seconds <= 30) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, Math.min(30_000, date - Date.now()));
  return null;
}

export async function retry(operation, { maxAttempts = 3, delays = [1000, 2000], sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration)) } = {}) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await operation(attempt + 1);
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts || !isRetryableError(error)) throw error;
      await sleep(retryAfterDelay(error) ?? delays[attempt - 1] ?? delays.at(-1) ?? 2000);
    }
  }
  throw new Error("Retry operation failed");
}

export { isRetryableError };