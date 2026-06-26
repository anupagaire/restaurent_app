import { refreshAccessToken } from "./auth";

const API = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function apiFetch(url: string, options: any = {}) {
  let token = localStorage.getItem("access_token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let res = await fetch(`${API}${url}`, {
    ...options,
    headers,
  });

  // ✅ Token expired → refresh and retry
  if (res.status === 401 && !url.includes('/auth/refresh/') && !url.includes('/token/refresh/')) {
    console.log('🔄 401 detected, refreshing token...');
    
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing && refreshPromise) {
      console.log('⏳ Already refreshing, waiting...');
      await refreshPromise;
    } else {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      // if (!newToken) {
      //   console.error('❌ Refresh failed, redirecting to login');
      //   throw new Error("Session expired");
      // }



if (!newToken) {
  console.error('❌ Refresh failed, redirecting to login');
  localStorage.clear();
  document.cookie = 'access_token=; path=/; max-age=0';
  document.cookie = 'role=; path=/; max-age=0';
  window.location.href = '/login';
  return new Response(null, { status: 401 });
}


      token = newToken;
    }

    console.log('🔄 Retrying request with new token...');
    
    const retryHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    res = await fetch(`${API}${url}`, {
      ...options,
      headers: retryHeaders,
    });
  }

  return res;
}