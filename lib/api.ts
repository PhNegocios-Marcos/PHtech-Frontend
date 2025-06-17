// lib/fetchWithAuth.ts
export async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  const apiUrl = "http://localhost:8000";

  const res = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (data.erro === "Erro ao buscar usuários") {
    window.location.href = "/dashboard/login"; // Corrigido: "dashboar" → "dashboard"
    return null;
  }

  return data;
}
