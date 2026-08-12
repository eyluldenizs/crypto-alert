import styles from "./StatusMessage.module.css";

export default function StatusMessage({ type = "info", children }) {
  if (!children) {
    return null;
  }

  return <p className={`${styles.message} ${styles[type]}`}>{children}</p>;
}
