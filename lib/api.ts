import { refreshAccessToken } from "./auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(url: string, options: any = {}) {
  let token = localStorage.getItem("access_token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  let res = await fetch(`${API}${url}`, {
    ...options,
    headers,
  });

  // Token expired → refresh and retry
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw new Error("Session expired");
    }

    const retryHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${newToken}`,
      ...options.headers,
    };

    res = await fetch(`${API}${url}`, {
      ...options,
      headers: retryHeaders,
    });
  }

  return res;
}