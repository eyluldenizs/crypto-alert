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
          value={threshold}
          onChange={(event) => onThresholdChange(event.target.value)}
          type="number"
          min="0"
          step="any"
          placeholder="Örn: 70000"
        />
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

      <Button type="submit" variant="fullWidth">
        Kural ekle
      </Button>

      <StatusMessage>{formStatus}</StatusMessage>
    </form>
  );
}
