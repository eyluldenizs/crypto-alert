import { z } from "zod";

const coins = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "ripple", name: "XRP", symbol: "XRP" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  { id: "avalanche-2", name: "Avalanche", symbol: "AVAX" },
  { id: "polkadot", name: "Polkadot", symbol: "DOT" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK" },
  { id: "tron", name: "TRON", symbol: "TRX" },
];

const coinPriceSchema = z.object({
  usd: z.number(),
});

const coinGeckoResponseSchema = z.record(z.string(), coinPriceSchema);

export async function GET() {
  try {
    const ids = coins.map((coin) => coin.id).join(",");

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 30,
        },
      },
    );

    if (!response.ok) {
      return Response.json(
        { ok: false, error: "CoinGecko fiyat verisi alınamadı." },
        { status: 502 },
      );
    }

    const rawData = await response.json();
    const parsedData = coinGeckoResponseSchema.safeParse(rawData);

    if (!parsedData.success) {
      return Response.json(
        { ok: false, error: "CoinGecko cevabı beklenen formatta değil." },
        { status: 502 },
      );
    }

    const prices = coins.map((coin) => {
      const coinPrice = parsedData.data[coin.id];

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        priceUsd: coinPrice?.usd,
      };
    });

    const hasMissingPrice = prices.some(
      (coin) => typeof coin.priceUsd !== "number",
    );

    if (hasMissingPrice) {
      return Response.json(
        { ok: false, error: "Bazı coin fiyatları CoinGecko cevabında eksik." },
        { status: 502 },
      );
    }

    return Response.json({
      ok: true,
      prices,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Fiyatlar alınırken bir hata oluştu." },
      { status: 500 },
    );
  }
}
