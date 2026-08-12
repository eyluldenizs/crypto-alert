import styles from "./SummaryStats.module.css";

export default function SummaryStats({ prices, rules }) {
  const pendingRules = rules.filter((rule) => rule.status === "pending").length;
  const triggeredRules = rules.filter(
    (rule) => rule.status === "triggered",
  ).length;

  const stats = [
    { label: "Canlı varlık", value: prices.length },
    { label: "Bekleyen kural", value: pendingRules },
    { label: "Tetiklenen kural", value: triggeredRules },
  ];

  return (
    <section className={styles.stats}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.card}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </section>
  );
}
