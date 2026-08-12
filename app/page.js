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
import { alertAssets, directionLabels, statusLabels } from "../lib/constants";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import PriceList from "../components/PriceList";

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

            <form
              onSubmit={addAlertRule}
              style={{
                display: "grid",
                gap: 12,
                width: "100%",
                marginBottom: 24,
              }}
            >
              <label>
                Coin
                <select
                  value={selectedCoin}
                  onChange={(event) => setSelectedCoin(event.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 10,
                    marginTop: 6,
                  }}
                >
                  {alertAssets.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Eşik değer
                <input
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Örn: 70000"
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 10,
                    marginTop: 6,
                  }}
                />
              </label>

              <label>
                Yön
                <select
                  value={direction}
                  onChange={(event) => setDirection(event.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 10,
                    marginTop: 6,
                  }}
                >
                  <option value="above">Üstüne çıkarsa</option>
                  <option value="below">Altına inerse</option>
                </select>
              </label>

              <Button type="submit" variant="fullWidth">
                Kural ekle
              </Button>

              <StatusMessage>{formStatus}</StatusMessage>
            </form>

            {rulesStatus === "loading" && (
              <StatusMessage>Kurallar yükleniyor...</StatusMessage>
            )}

            {rulesStatus === "error" && (
              <StatusMessage type="error">{rulesError}</StatusMessage>
            )}

            {rulesStatus === "success" && rules.length === 0 && (
              <StatusMessage>Henüz uyarı kuralı yok.</StatusMessage>
            )}

            {rulesStatus === "success" && rules.length > 0 && (
              <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
                {rules.map((rule) => {
                  const coin = alertAssets.find(
                    (item) => item.id === rule.coin,
                  );

                  return (
                    <div
                      key={rule.id}
                      style={{
                        border: "1px solid #ddd",
                        padding: 16,
                      }}
                    >
                      <strong>
                        {coin?.name || rule.coin} ({coin?.symbol || rule.coin})
                      </strong>

                      <p>
                        {directionLabels[rule.direction]}: $
                        {Number(rule.threshold).toLocaleString("en-US")}
                      </p>

                      <p>Durum: {statusLabels[rule.status] || rule.status}</p>

                      <Button
                        onClick={() => deleteAlertRule(rule.id)}
                        variant="danger"
                      >
                        Sil
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
