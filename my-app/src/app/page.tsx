"use client";

import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [heroImageSrc, setHeroImageSrc] = useState("https://ik.imagekit.io/fara1dandara/main-home-img.png");
  const [ceramicImageSrc, setCeramicImageSrc] = useState("https://ik.imagekit.io/fara1dandara/ceramic-bowl-img.png");
  const [linenImageSrc, setLinenImageSrc] = useState("https://ik.imagekit.io/fara1dandara/linen-pillow-img.png");
  const [cuttingBoardImageSrc, setCuttingBoardImageSrc] = useState("https://ik.imagekit.io/fara1dandara/cutting-board-img.png");

  const handleImageError = (imageType: string) => (event: any) => {
    const fallbackMap: { [key: string]: string } = {
      hero: "/main-home-img.png",
      ceramic: "/ceramic-bowl-img.png",
      linen: "/linen-pillow-img.png",
      cuttingBoard: "/cutting-board-img.png"
    };

    const currentSrc = event.target.src;
    if (currentSrc.startsWith('http') && fallbackMap[imageType]) {
      switch (imageType) {
        case 'hero':
          setHeroImageSrc(fallbackMap.hero);
          break;
        case 'ceramic':
          setCeramicImageSrc(fallbackMap.ceramic);
          break;
        case 'linen':
          setLinenImageSrc(fallbackMap.linen);
          break;
        case 'cuttingBoard':
          setCuttingBoardImageSrc(fallbackMap.cuttingBoard);
          break;
      }
    }
  };
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Discover<br />
              Authentic<br />
              Artisan Crafts
            </h1>
            <p className={styles.heroSubtitle}>
              Support independent creators and bring unique, sustainable treasures
              into your life. Each item reflects a piece of an artisan&apos;s journey and
              passion.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/shop" className={styles.primaryButton}>
                Start Exploring
              </Link>
              <Link href="/sellers" className={styles.secondaryButton}>
                Become a Seller
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
    src={heroImageSrc}
    alt="Handcrafted artisan products showcase"
    width={600}
    height={500}
    priority
    className={styles.heroImageElement}
    onError={handleImageError('hero')}
  />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>500+</h3>
            <p className={styles.statLabel}>Artisans</p>
          </div>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>5k+</h3>
            <p className={styles.statLabel}>Products</p>
          </div>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>100%</h3>
            <p className={styles.statLabel}>Handmade</p>
          </div>
        </div>
      </section>

      {/* Crafting Connections Section */}
      <section className={styles.crafting}>
        <h2 className={styles.sectionTitle}>Crafting connections</h2>
        <p className={styles.sectionSubtitle}>
          Where creativity meets passion, every handmade piece bridges the gap
          between artisan and art lover.
        </p>
      </section>

      {/* Featured Products Section */}
      <section className={styles.featured}>
        <h2 className={styles.sectionTitle}>Featured Artisan Products</h2>
        <p className={styles.sectionDescription}>
          Handpicked treasures from our talented creators. Each piece is
          one-of-a-kind and crafted with care.
        </p>
        <div className={styles.itemsGrid}>
          <div className={styles.itemCard}>
            <div className={styles.itemImage}>
              <Image
                src={ceramicImageSrc}
                alt="Handmade Ceramic Bowl by Sarah Chen"
                width={400}
                height={280}
                className={styles.productImage}
                onError={handleImageError('ceramic')}
              />
            </div>
            <div className={styles.itemInfo}>
              <h4 className={styles.itemName}>Handmade Ceramic Bowl</h4>
              <p className={styles.itemArtist}>by Sarah Chen</p>
              <p className={styles.itemPrice}>$85</p>
            </div>
          </div>

          <div className={styles.itemCard}>
            <div className={styles.itemImage}>
              <Image
                src={linenImageSrc}
                alt="Organic Linen Throw Pillow & Macrame Weave"
                width={400}
                height={280}
                className={styles.productImage}
                onError={handleImageError('linen')}
              />
            </div>
            <div className={styles.itemInfo}>
              <h4 className={styles.itemName}>Organic Linen Throw Pillow & Macrame Weave</h4>
              <p className={styles.itemArtist}>by Emma Rodriguez</p>
              <p className={styles.itemPrice}>$65</p>
            </div>
          </div>

          <div className={styles.itemCard}>
            <div className={styles.itemImage}>
              <Image
                src={cuttingBoardImageSrc}
                alt="Artisan Wood-Latticed Cutting Board"
                width={400}
                height={280}
                className={styles.productImage}
                onError={handleImageError('cuttingBoard')}
              />
            </div>
            <div className={styles.itemInfo}>
              <h4 className={styles.itemName}>Artisan Wood-Latticed Cutting Board</h4>
              <p className={styles.itemArtist}>by Michael Thompson</p>
              <p className={styles.itemPrice}>$95</p>
            </div>
          </div>
        </div>
        <div className={styles.viewAllContainer}>
          <Link href="/shop" className={styles.viewAllButton}>
            View All Products
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>Stay Connected</h2>
          <h3 className={styles.newsletterSubtitle}>Discover New Creations</h3>
          <p className={styles.newsletterDescription}>
            Subscribe to our newsletter for exclusive updates, artisan
            spotlights, and special collections delivered to your inbox.
          </p>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.emailInput}
              required
            />
            <button type="submit" className={styles.subscribeButton}>
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}