"use client";

import styles from "./about.module.css";
import Image from "next/image";
import { useState } from "react";

export default function StorySection() {
  const [storyImageSrc, setStoryImageSrc] = useState("https://ik.imagekit.io/fara1dandara/story-section-image.webp");

  const handleImageError = () => {
    if (storyImageSrc.startsWith('http')) {
      setStoryImageSrc("/story-section-image.webp");
    }
  };
  return (
    <section className={styles.story}>
      <div className={styles.storyImage}>
         <Image
          src={storyImageSrc}
          alt="story-section"
          width={400}
          height={400}
          className={styles.logo}
          onError={handleImageError}
        />
      </div>

      <div className={styles.storyText}>
        <h2>Our Story</h2>
        <p>
          Loom & Tread was founded in 2020 with a simple mission: to create a
          space where artisans could thrive and their creations could reach the
          world. We recognize that handmade goods carry a special story and soul
          that mass-produced items simply cannot replicate.
        </p>

        <p>
          What started as a small platform has grown into a vibrant community of
          talented artisans creating everything from ceramics and textiles to
          woodcraft and jewelry. Each product tells a unique story of
          dedication, skill, and passion.
        </p>

        <span className={styles.badge}>✨ Handmade with purpose since 2020</span>
      </div>
    </section>
  );
}
