export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function fallbackMessage(status) {
  // Express answers an oversized body with an HTML page, so there's no JSON error to read.
  if (status === 413) return "That's too large to send. Try a smaller image.";
  if (status >= 500) return "The server isn't responding. Try again in a moment.";
  return "Something went wrong. Try again.";
}

export async function api(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error ?? fallbackMessage(response.status), response.status);
  }
  return data;
}
