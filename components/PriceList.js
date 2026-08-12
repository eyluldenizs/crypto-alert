import { formatAssetPrice } from "../lib/constants";
import styles from "./PriceList.module.css";
const typeLabels = {
  crypto: "Crypto",
  currency: "Döviz",
  metal: "Metal",
};
export default function PriceList({ prices }) {
  return (
    <div className={styles.list}>
      {prices.map((asset) => (
        <div key={asset.id} className={styles.card}>
          <div>
            <strong>
              {asset.name} ({asset.symbol})
            </strong>

            <span className={styles.badge}>{typeLabels[asset.type]}</span>
          </div>

          <p>{formatAssetPrice(asset)}</p>
        </div>
      ))}
    </div>
  );
}
