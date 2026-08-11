import { z } from "zod";
import {
  cryptoAssets,
  currencyAssets,
  metalAssets,
} from "../../../lib/constants";
const coinPriceSchema = z.object({
  usd: z.number(),
});
const coinGeckoResponseSchema = z.record(z.string(), coinPriceSchema);

export async function GET() {
  try {
    const ids = cryptoAssets.map((coin) => coin.id).join(",");

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

    const prices = cryptoAssets.map((coin) => {
      const coinPrice = parsedData.data[coin.id];

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        priceUsd: coinPrice?.usd,
        type: "crypto",
      };
    });
    const currencyPrices = await Promise.all(
      currencyAssets.map(async (currency) => {
        const response = await fetch(
          `https://api.frankfurter.app/latest?from=${currency.from}&to=${currency.to}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Döviz verisi alınamadı.");
        }

        const data = await response.json();
        const rate = data.rates?.[currency.to];

        if (typeof rate !== "number") {
          throw new Error("Döviz cevabı beklenen formatta değil.");
        }

        return {
          id: currency.id,
          name: currency.name,
          symbol: currency.symbol,
          priceUsd: rate,
          type: "currency",
        };
      }),
    );

    let metalPrices = [];

    try {
      const response = await fetch(
        "https://api.frankfurter.dev/v2/rate/XAU/TRY",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Altın verisi alınamadı.");
      }

      const data = await response.json();
      const ouncePriceTry = data.rate;

      if (typeof ouncePriceTry !== "number") {
        throw new Error("Altın cevabı beklenen formatta değil.");
      }

      const gramGoldPriceTry = ouncePriceTry / 31.1034768;

      metalPrices = [
        {
          id: metalAssets[0].id,
          name: metalAssets[0].name,
          symbol: metalAssets[0].symbol,
          priceUsd: gramGoldPriceTry,
          type: "metal",
        },
      ];
    } catch (error) {
      metalPrices = [];
    }

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
      prices: [...prices, ...currencyPrices, ...metalPrices],
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Fiyatlar alınırken bir hata oluştu." },
      { status: 500 },
    );
  }
}
