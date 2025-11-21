import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Header */}

      {/* Hero Section */}
      <section className={styles.hero}>
        <h2>Discover Unique Handmade Creations</h2>
        <p>Support artisans and find one-of-a-kind products crafted with passion.</p>
        <button className={styles.ctaButton}>Explore Collections</button>
      </section>

      {/* About Section */}
      <section className={styles.about}>
        <h3>About Handcrafted Haven</h3>
        <p>
          Handcrafted Haven is an online marketplace connecting passionate
          artisans with conscious consumers looking for unique, sustainable,
          handmade items.
        </p>
      </section>

      {/* Featured Items */}
      <section className={styles.featured}>
        <h3>Featured Creations</h3>
        <div className={styles.itemsGrid}>
          <div className={styles.itemCard}>
            <div className={styles.placeholderImg}></div>
            <h4>Handmade Ceramic Vase</h4>
            <p>$35.00</p>
          </div>

          <div className={styles.itemCard}>
            <div className={styles.placeholderImg}></div>
            <h4>Macrame Wall Hanging</h4>
            <p>$28.00</p>
          </div>

          <div className={styles.itemCard}>
            <div className={styles.placeholderImg}></div>
            <h4>Wooden Carved Spoon Set</h4>
            <p>$22.00</p>
          </div>
        </div>
      </section>

      {/* Footer */}
    </main>
  );
}
