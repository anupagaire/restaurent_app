const API = process.env.NEXT_PUBLIC_API_URL;

export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");

  if (!refresh) return null;

  const res = await fetch(`${API}/api/v1/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  const data = await res.json();

  if (!res.ok) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return null;
  }

  localStorage.setItem("access_token", data.access);
  return data.access;
}