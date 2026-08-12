import { alertAssets, directionLabels, statusLabels } from "../lib/constants";
import Button from "./Button";
import StatusMessage from "./StatusMessage";
import styles from "./AlertRuleList.module.css";

export default function AlertRuleList({
  rules,
  rulesStatus,
  rulesError,
  onDeleteRule,
}) {
  if (rulesStatus === "loading") {
    return <StatusMessage>Kurallar yükleniyor...</StatusMessage>;
  }

  if (rulesStatus === "error") {
    return <StatusMessage type="error">{rulesError}</StatusMessage>;
  }

  if (rules.length === 0) {
    return <StatusMessage>Henüz uyarı kuralı yok.</StatusMessage>;
  }

  return (
    <div className={styles.list}>
      {rules.map((rule) => {
        const asset = alertAssets.find((item) => item.id === rule.coin);

        return (
          <div key={rule.id} className={styles.card}>
            <strong>
              {asset?.name || rule.coin} ({asset?.symbol || rule.coin})
            </strong>

            <p>
              {directionLabels[rule.direction]}:{" "}
              {Number(rule.threshold).toLocaleString("tr-TR")}
            </p>

            <p>Durum: {statusLabels[rule.status] || rule.status}</p>

            <Button onClick={() => onDeleteRule(rule.id)} variant="danger">
              Sil
            </Button>
          </div>
        );
      })}
    </div>
  );
}
