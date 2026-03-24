const API_URL = "https://api.sledix.tech";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: endpoint.includes("/auth") ? "include" : "same-origin",
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || "Something went wrong");
  }
  return payload.data;
}