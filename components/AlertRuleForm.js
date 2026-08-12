import { alertAssets } from "../lib/constants";
import Button from "./Button";
import StatusMessage from "./StatusMessage";
import styles from "./AlertRuleForm.module.css";

export default function AlertRuleForm({
  selectedCoin,
  threshold,
  direction,
  formStatus,
  onSelectedCoinChange,
  onThresholdChange,
  onDirectionChange,
  onSubmit,
}) {
  const trimmedThreshold = threshold.trim();
  const numericThreshold = Number(threshold);

  const thresholdError =
    trimmedThreshold.length === 0
      ? "Bu alan zorunludur."
      : !Number.isFinite(numericThreshold) || numericThreshold <= 0
        ? "Eşik değer 0'dan büyük olmalıdır."
        : "";

  const isSubmitDisabled = thresholdError.length > 0;
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <label className={styles.field}>
        Coin
        <select
          value={selectedCoin}
          onChange={(event) => onSelectedCoinChange(event.target.value)}
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
          onChange={(event) => onThresholdChange(event.target.value)}
          type="number"
          min="0"
          step="any"
          placeholder="Örn: 70000"
        />
        {thresholdError && (
          <span className={styles.errorText}>{thresholdError}</span>
        )}
      </label>

      <label className={styles.field}>
        Yön
        <select
          value={direction}
          onChange={(event) => onDirectionChange(event.target.value)}
        >
          <option value="above">Üstüne çıkarsa</option>
          <option value="below">Altına inerse</option>
        </select>
      </label>

      <Button type="submit" variant="fullWidth" disabled={isSubmitDisabled}>
        Kural ekle
      </Button>

      <StatusMessage>{formStatus}</StatusMessage>
    </form>
  );
}
