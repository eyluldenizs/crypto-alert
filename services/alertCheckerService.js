import { z } from "zod";
import { adminDb } from "../lib/firebaseAdmin";
import { sendTelegramMessage } from "./telegramService";

const alertRuleSchema = z.object({
  coin: z.string(),
  threshold: z.number(),
  direction: z.enum(["above", "below"]),
  status: z.enum(["pending", "triggered"]),
});

const priceSchema = z.record(
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

async function fetchRulePrices(rules) {
  const coinIds = [...new Set(rules.map((rule) => rule.coin))].join(",");

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("CoinGecko fiyat verisi alınamadı.");
  }

  const rawPrices = await response.json();
  const parsedPrices = priceSchema.safeParse(rawPrices);

  if (!parsedPrices.success) {
    throw new Error("CoinGecko cevabı beklenen formatta değil.");
  }

  return parsedPrices.data;
}

async function getPendingRules() {
  const snapshot = await adminDb
    .collection("alertRules")
    .where("status", "==", "pending")
    .get();

  return snapshot.docs
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
}

export async function checkPendingAlertRules() {
  const rules = await getPendingRules();

  if (rules.length === 0) {
    return {
      ok: true,
      checkedRules: 0,
      triggeredRules: 0,
    };
  }

  const prices = await fetchRulePrices(rules);
  let triggeredRules = 0;

  for (const rule of rules) {
    const currentPrice = prices[rule.coin]?.usd;

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

  return {
    ok: true,
    checkedRules: rules.length,
    triggeredRules,
  };
}
