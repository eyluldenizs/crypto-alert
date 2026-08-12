import { formatAssetPrice } from "../lib/constants";
import styles from "./PriceList.module.css";

export default function PriceList({ prices }) {
  return (
    <div className={styles.list}>
      {prices.map((asset) => (
        <div key={asset.id} className={styles.card}>
          <strong>
            {asset.name} ({asset.symbol})
          </strong>

          <p>{formatAssetPrice(asset)}</p>
        </div>
      ))}
    </div>
  );
}
