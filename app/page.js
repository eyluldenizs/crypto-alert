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
  updateDoc,
} from "firebase/firestore";
import styles from "./page.module.css";
import { db } from "../lib/firebase";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import PriceList from "../components/PriceList";
import AlertRuleForm from "../components/AlertRuleForm";
import AlertRuleList from "../components/AlertRuleList";
import EditAlertRuleModal from "../components/EditAlertRuleModal";

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
  const [editingRule, setEditingRule] = useState(null);

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

  async function updateAlertRule(ruleId, updates) {
    await updateDoc(doc(db, "alertRules", ruleId), {
      ...updates,
      status: "pending",
    });
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
    <main className={styles.main}>
      <h1 className={styles.title}>Crypto Alert</h1>
      <div className={styles.layout}>
        <div className={styles.leftColumn}>
          <section className={styles.section}>
            <h2>Telegram Test</h2>

            <Button onClick={sendTelegramMessage}>
              Telegram test mesajı gönder
            </Button>

            <StatusMessage>{telegramStatus}</StatusMessage>
          </section>

          <section className={styles.section}>
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
          <section className={styles.formPanel}>
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
              onEditRule={setEditingRule}
            />
          </section>
        </div>
      </div>
      <EditAlertRuleModal
        rule={editingRule}
        onClose={() => setEditingRule(null)}
        onSave={updateAlertRule}
      />
    </main>
  );
}
