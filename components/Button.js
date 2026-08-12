import styles from "./Button.module.css";

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
