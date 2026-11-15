import type { RecentCollection } from "../model/recentCollection.types";
import styles from "./RecentCollectionCard.module.css";

type RecentCollectionCardProps = {
  collection: RecentCollection;
};

export default function RecentCollectionCard({
  collection,
}: RecentCollectionCardProps) {
  return (
    <li className={styles.card}>
      <p className={styles.date}>{collection.date}</p>
      <p className={styles.title}>{collection.title}</p>
    </li>
  );
}
