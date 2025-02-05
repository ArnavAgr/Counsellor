// ...existing imports and functions...

// Fetch states from the backend (unique states from nit_combined.xlsx)
export async function getStates(): Promise<string[]> {
  const response = await fetch('/api/states/');
  if (!response.ok) {
    throw new Error('Failed to fetch states');
  }
  return response.json();
}

// ...existing exports...
