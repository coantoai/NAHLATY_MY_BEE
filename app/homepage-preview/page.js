import MYBEE_REFERENCE from "../mybee-reference-data";
import styles from "./page.module.css";

export default function HomepagePreview() {
  return (
    <main className={styles.page} aria-label="Nahlaty My Bee homepage">
      <img
        className={styles.reference}
        src={MYBEE_REFERENCE}
        alt="نحلتي My Bee — الصفحة الرئيسية"
      />
    </main>
  );
}
