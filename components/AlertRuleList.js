import { useState } from "react";
import { alertAssets, directionLabels, statusLabels } from "../lib/constants";
import Button from "./Button";
import StatusMessage from "./StatusMessage";
import styles from "./AlertRuleList.module.css";

export default function AlertRuleList({
  rules,
  rulesStatus,
  rulesError,
  onDeleteRule,
  onEditRule,
}) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRules =
    statusFilter === "all"
      ? rules
      : rules.filter((rule) => rule.status === statusFilter);
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
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <button
          type="button"
          className={statusFilter === "all" ? styles.activeFilter : ""}
          onClick={() => setStatusFilter("all")}
        >
          Tümü
        </button>

        <button
          type="button"
          className={statusFilter === "pending" ? styles.activeFilter : ""}
          onClick={() => setStatusFilter("pending")}
        >
          Beklemede
        </button>

        <button
          type="button"
          className={statusFilter === "triggered" ? styles.activeFilter : ""}
          onClick={() => setStatusFilter("triggered")}
        >
          Tetiklendi
        </button>
      </div>

      {filteredRules.length === 0 ? (
        <StatusMessage>Bu filtrede gösterilecek kural yok.</StatusMessage>
      ) : (
        <div className={styles.list}>
          {filteredRules.map((rule) => {
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
                <Button onClick={() => onEditRule(rule)}>Düzenle</Button>

                <Button onClick={() => onDeleteRule(rule.id)} variant="danger">
                  Sil
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
