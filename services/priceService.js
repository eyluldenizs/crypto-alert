export async function fetchLivePrices() {
  const response = await fetch("/api/prices");
  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Fiyatlar alınamadı.");
  }

  return data.prices;
}
