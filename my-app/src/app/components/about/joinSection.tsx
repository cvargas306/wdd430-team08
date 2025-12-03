import styles from "./about.module.css";
import Link from "next/link";

export default function JoinSection() {
  return (
    <section className={styles.joinSection}>
      <h2>Ready to Join Our Community?</h2>

      <p>
        Whether you're an artisan looking to share your craft or a customer
        seeking unique handmade pieces, there's a place for you at Loom & Tread
      </p>

      <div className={styles.joinButtons}>
        <Link href="/signup?type=seller" className={styles.btnLight}>Become a Seller</Link>
        <Link href="/shop" className={styles.btnDark}>Shop Products</Link>
      </div>
    </section>
  );
}
