export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", 
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || "Something went wrong");
  }
  return payload.data;
}