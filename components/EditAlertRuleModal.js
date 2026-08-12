import { useEffect, useState } from "react";
import { alertAssets } from "../lib/constants";
import Button from "./Button";
import StatusMessage from "./StatusMessage";
import styles from "./EditAlertRuleModal.module.css";

export default function EditAlertRuleModal({ rule, onClose, onSave }) {
  const [selectedCoin, setSelectedCoin] = useState("");
  const [threshold, setThreshold] = useState("");
  const [direction, setDirection] = useState("above");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rule) {
      return;
    }

    setSelectedCoin(rule.coin);
    setThreshold(String(rule.threshold));
    setDirection(rule.direction);
    setError("");
  }, [rule]);

  if (!rule) {
    return null;
  }

  const trimmedThreshold = threshold.trim();
  const numericThreshold = Number(threshold);

  const thresholdError =
    trimmedThreshold.length === 0
      ? "Bu alan zorunludur."
      : !Number.isFinite(numericThreshold) || numericThreshold <= 0
        ? "Eşik değer 0'dan büyük olmalıdır."
        : "";

  const isSaveDisabled = thresholdError.length > 0;

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSaveDisabled) {
      return;
    }

    setError("");

    try {
      await onSave(rule.id, {
        coin: selectedCoin,
        threshold: numericThreshold,
        direction,
      });

      onClose();
    } catch (error) {
      setError("Kural güncellenemedi.");
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Kuralı düzenle</h3>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            Coin
            <select
              value={selectedCoin}
              onChange={(event) => setSelectedCoin(event.target.value)}
            >
              {alertAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            Eşik değer
            <input
              className={thresholdError ? styles.invalidInput : ""}
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              type="number"
              min="0"
              step="any"
            />
            {thresholdError && (
              <span className={styles.errorText}>{thresholdError}</span>
            )}
          </label>

          <label className={styles.field}>
            Yön
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            >
              <option value="above">Üstüne çıkarsa</option>
              <option value="below">Altına inerse</option>
            </select>
          </label>

          <div className={styles.actions}>
            <Button type="button" onClick={onClose}>
              Vazgeç
            </Button>

            <Button type="submit" disabled={isSaveDisabled}>
              Kaydet
            </Button>
          </div>

          <StatusMessage type="error">{error}</StatusMessage>
        </form>
      </div>
    </div>
  );
}
