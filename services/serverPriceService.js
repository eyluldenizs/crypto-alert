import { z } from "zod";
import { cryptoAssets, currencyAssets, metalAssets } from "../lib/constants";

const coinPriceSchema = z.object({
  usd: z.number(),
});

const coinGeckoResponseSchema = z.record(z.string(), coinPriceSchema);

export async function fetchCryptoPrices() {
  const ids = cryptoAssets.map((asset) => asset.id).join(",");

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
    throw new Error("CoinGecko fiyat verisi alınamadı.");
  }

  const rawData = await response.json();
  const parsedData = coinGeckoResponseSchema.safeParse(rawData);

  if (!parsedData.success) {
    throw new Error("CoinGecko cevabı beklenen formatta değil.");
  }

  const prices = cryptoAssets.map((asset) => {
    const assetPrice = parsedData.data[asset.id];

    return {
      id: asset.id,
      name: asset.name,
      symbol: asset.symbol,
      priceUsd: assetPrice?.usd,
      type: asset.type,
    };
  });

  const hasMissingPrice = prices.some(
    (asset) => typeof asset.priceUsd !== "number",
  );

  if (hasMissingPrice) {
    throw new Error("Bazı coin fiyatları CoinGecko cevabında eksik.");
  }

  return prices;
}

export async function fetchCurrencyPrices() {
  return Promise.all(
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
        type: currency.type,
      };
    }),
  );
}

export async function fetchMetalPrices() {
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
    const gramGold = metalAssets[0];

    return [
      {
        id: gramGold.id,
        name: gramGold.name,
        symbol: gramGold.symbol,
        priceUsd: gramGoldPriceTry,
        type: gramGold.type,
      },
    ];
  } catch (error) {
    return [];
  }
}

export async function fetchAllAssetPrices() {
  const [cryptoPrices, currencyPrices, metalPrices] = await Promise.all([
    fetchCryptoPrices(),
    fetchCurrencyPrices(),
    fetchMetalPrices(),
  ]);

  return [...cryptoPrices, ...currencyPrices, ...metalPrices];
}
