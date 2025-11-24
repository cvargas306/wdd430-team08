import styles from "./about.module.css";

export default function JoinSection() {
  return (
    <section className={styles.joinSection}>
      <h2>Ready to Join Our Community?</h2>

      <p>
        Whether you're an artisan looking to share your craft or a customer
        seeking unique handmade pieces, there's a place for you at Loom & Tread
      </p>

      <div className={styles.joinButtons}>
        <button className={styles.btnLight}>Become a Seller</button>
        <button className={styles.btnDark}>Shop Products</button>
      </div>
    </section>
  );
}
