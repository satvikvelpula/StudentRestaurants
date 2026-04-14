export const baseUrl = "https://media2.edu.metropolia.fi/restaurant/api/v1";

export async function fetchData(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(baseUrl + endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }

  return res.json();
}