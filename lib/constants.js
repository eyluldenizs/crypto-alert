export const cryptoAssets = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", type: "crypto" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", type: "crypto" },
  { id: "solana", name: "Solana", symbol: "SOL", type: "crypto" },
  { id: "ripple", name: "XRP", symbol: "XRP", type: "crypto" },
  { id: "cardano", name: "Cardano", symbol: "ADA", type: "crypto" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", type: "crypto" },
  { id: "avalanche-2", name: "Avalanche", symbol: "AVAX", type: "crypto" },
  { id: "polkadot", name: "Polkadot", symbol: "DOT", type: "crypto" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK", type: "crypto" },
  { id: "tron", name: "TRON", symbol: "TRX", type: "crypto" },
];

export const currencyAssets = [
  {
    id: "usd-try",
    name: "US Dollar",
    symbol: "USD/TRY",
    type: "currency",
    from: "USD",
    to: "TRY",
  },
  {
    id: "eur-try",
    name: "Euro",
    symbol: "EUR/TRY",
    type: "currency",
    from: "EUR",
    to: "TRY",
  },
];

export const metalAssets = [
  {
    id: "gram-gold",
    name: "Gram Altın",
    symbol: "GAU/TRY",
    type: "metal",
  },
];

export const alertAssets = [...cryptoAssets, ...currencyAssets, ...metalAssets];

export const directionLabels = {
  above: "Üstüne çıkarsa",
  below: "Altına inerse",
};

export const statusLabels = {
  pending: "Beklemede",
  triggered: "Tetiklendi",
};

export function formatAssetPrice(asset) {
  if (asset.type === "currency" || asset.type === "metal") {
    return `${asset.priceUsd.toLocaleString("tr-TR")} TL`;
  }

  return `$${asset.priceUsd.toLocaleString("en-US")}`;
}
