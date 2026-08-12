"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import PriceList from "../components/PriceList";
import AlertRuleForm from "../components/AlertRuleForm";
import AlertRuleList from "../components/AlertRuleList";

export default function Home() {
  const [telegramStatus, setTelegramStatus] = useState("");
  const [prices, setPrices] = useState([]);
  const [pricesStatus, setPricesStatus] = useState("loading");
  const [pricesError, setPricesError] = useState("");

  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [threshold, setThreshold] = useState("");
  const [direction, setDirection] = useState("above");
  const [rules, setRules] = useState([]);
  const [rulesStatus, setRulesStatus] = useState("loading");
  const [rulesError, setRulesError] = useState("");
  const [formStatus, setFormStatus] = useState("");

  async function sendTelegramMessage() {
    setTelegramStatus("Gönderiliyor...");

    try {
      const response = await fetch("/api/telegram-test", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setTelegramStatus(data.error || "Mesaj gönderilemedi.");
        return;
      }

      setTelegramStatus("Telegram mesajı gönderildi.");
    } catch (error) {
      setTelegramStatus("Bir hata oluştu.");
    }
  }

  async function fetchPrices() {
    setPricesStatus("loading");
    setPricesError("");

    try {
      const response = await fetch("/api/prices");
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setPricesStatus("error");
        setPricesError(data.error || "Fiyatlar alınamadı.");
        return;
      }

      setPrices(data.prices);
      setPricesStatus("success");
    } catch (error) {
      setPricesStatus("error");
      setPricesError("Fiyatlar alınırken bir hata oluştu.");
    }
  }

  async function addAlertRule(event) {
    event.preventDefault();

    const numericThreshold = Number(threshold);

    if (!Number.isFinite(numericThreshold) || numericThreshold <= 0) {
      setFormStatus("Geçerli bir eşik değer gir.");
      return;
    }

    setFormStatus("Kural ekleniyor...");

    try {
      await addDoc(collection(db, "alertRules"), {
        coin: selectedCoin,
        threshold: numericThreshold,
        direction,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setThreshold("");
      setFormStatus("Kural eklendi.");
    } catch (error) {
      setFormStatus("Kural eklenemedi.");
    }
  }

  async function deleteAlertRule(ruleId) {
    try {
      await deleteDoc(doc(db, "alertRules", ruleId));
    } catch (error) {
      setRulesError("Kural silinemedi.");
    }
  }

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    const rulesQuery = query(
      collection(db, "alertRules"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      rulesQuery,
      (snapshot) => {
        const nextRules = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setRules(nextRules);
        setRulesStatus("success");
      },
      () => {
        setRulesStatus("error");
        setRulesError("Kurallar alınamadı.");
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1>Crypto Alert</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 24 }}>
          <section style={{ marginBottom: 32 }}>
            <h2>Telegram Test</h2>

            <Button onClick={sendTelegramMessage}>
              Telegram test mesajı gönder
            </Button>

            <StatusMessage>{telegramStatus}</StatusMessage>
          </section>

          <section>
            <h2>Canlı Fiyatlar</h2>

            <Button onClick={fetchPrices} disabled={pricesStatus === "loading"}>
              {pricesStatus === "loading"
                ? "Yükleniyor..."
                : "Fiyatları yenile"}
            </Button>

            {pricesStatus === "loading" && (
              <StatusMessage>Fiyatlar yükleniyor...</StatusMessage>
            )}

            {pricesStatus === "error" && (
              <StatusMessage type="error">{pricesError}</StatusMessage>
            )}

            {pricesStatus === "success" && <PriceList prices={prices} />}
          </section>
        </div>

        <div>
          <section
            style={{
              border: "1px solid #ddd",
              padding: 20,
              borderRadius: 8,
            }}
          >
            <h2>Uyarı Kuralları</h2>

            <AlertRuleForm
              selectedCoin={selectedCoin}
              threshold={threshold}
              direction={direction}
              formStatus={formStatus}
              onSelectedCoinChange={setSelectedCoin}
              onThresholdChange={setThreshold}
              onDirectionChange={setDirection}
              onSubmit={addAlertRule}
            />

            <AlertRuleList
              rules={rules}
              rulesStatus={rulesStatus}
              rulesError={rulesError}
              onDeleteRule={deleteAlertRule}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
