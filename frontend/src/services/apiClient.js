const API_URL = import.meta.env.VITE_API_URL;

export async function apiClient(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
