import { z } from "zod";
import { adminDb } from "../../../lib/firebaseAdmin";
import { sendTelegramMessage } from "../../../services/telegramService";

const alertRuleSchema = z.object({
  coin: z.string(),
  threshold: z.number(),
  direction: z.enum(["above", "below"]),
  status: z.enum(["pending", "triggered"]),
});

const coinGeckoResponseSchema = z.record(
  z.string(),
  z.object({
    usd: z.number(),
  }),
);

function isRuleTriggered(rule, currentPrice) {
  if (rule.direction === "above") {
    return currentPrice >= rule.threshold;
  }

  if (rule.direction === "below") {
    return currentPrice <= rule.threshold;
  }

  return false;
}

export async function POST() {
  try {
    const snapshot = await adminDb
      .collection("alertRules")
      .where("status", "==", "pending") //tekrar mesaj gitmesini engelleyen yer,sadece bekleyen kuralları okuyor
      .get();

    if (snapshot.empty) {
      return Response.json({
        ok: true,
        checkedRules: 0,
        triggeredRules: 0,
      });
    }

    const rules = snapshot.docs
      .map((document) => {
        const data = document.data();
        const parsedRule = alertRuleSchema.safeParse(data);

        if (!parsedRule.success) {
          return null;
        }

        return {
          id: document.id,
          ...parsedRule.data,
        };
      })
      .filter(Boolean);

    const coinIds = [...new Set(rules.map((rule) => rule.coin))].join(",");

    const priceResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!priceResponse.ok) {
      return Response.json(
        { ok: false, error: "CoinGecko fiyat verisi alınamadı." },
        { status: 502 },
      );
    }

    const rawPrices = await priceResponse.json();
    const parsedPrices = coinGeckoResponseSchema.safeParse(rawPrices);

    if (!parsedPrices.success) {
      return Response.json(
        { ok: false, error: "CoinGecko cevabı beklenen formatta değil." },
        { status: 502 },
      );
    }

    let triggeredRules = 0;

    for (const rule of rules) {
      const currentPrice = parsedPrices.data[rule.coin]?.usd;

      if (typeof currentPrice !== "number") {
        continue;
      }

      const triggered = isRuleTriggered(rule, currentPrice);

      if (!triggered) {
        continue;
      }

      await sendTelegramMessage(
        `Crypto Alert: ${rule.coin} $${currentPrice} oldu. Kural eşiği: $${rule.threshold}`,
      );

      await adminDb.collection("alertRules").doc(rule.id).update({
        status: "triggered",
        triggeredAt: new Date(),
        triggeredPrice: currentPrice,
      });

      triggeredRules += 1;
    }

    return Response.json({
      ok: true,
      checkedRules: rules.length,
      triggeredRules,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Kontrol sırasında hata oluştu." },
      { status: 500 },
    );
  }
}
export async function GET() {
  return POST();
}
export async function HEAD() {
  await POST();

  return new Response(null, {
    status: 200,
  });
}
