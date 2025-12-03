"use client";

import styles from "./about.module.css";
import Image from "next/image";
import { useState } from "react";

export default function ValuesSection() {
  const [creativityIconSrc, setCreativityIconSrc] = useState("https://ik.imagekit.io/fara1dandara/creativity-icon.webp");
  const [sustainableIconSrc, setSustainableIconSrc] = useState("https://ik.imagekit.io/fara1dandara/sustainable-icon.webp");
  const [communityIconSrc, setCommunityIconSrc] = useState("https://ik.imagekit.io/fara1dandara/community-icon.webp");

  const handleIconError = (iconType: string) => () => {
    const fallbackMap: { [key: string]: string } = {
      creativity: "/creativity-icon.webp",
      sustainable: "/sustainable-icon.webp",
      community: "/community-icon.webp"
    };

    const currentSrc = (event?.target as HTMLImageElement)?.src;
    if (currentSrc?.startsWith('http') && fallbackMap[iconType]) {
      switch (iconType) {
        case 'creativity':
          setCreativityIconSrc(fallbackMap.creativity);
          break;
        case 'sustainable':
          setSustainableIconSrc(fallbackMap.sustainable);
          break;
        case 'community':
          setCommunityIconSrc(fallbackMap.community);
          break;
      }
    }
  };

  const values = [
    {
      title: "Creativity First",
      text: "We celebrate the boundless creativity of artisans, providing them with a platform to showcase their unique vision and skills to the world.",
      icon: creativityIconSrc,
      iconType: "creativity"
    },
    {
      title: "Sustainable Practices",
      text: "We're committed to environmental responsibility. Our platform features makers who prioritize eco-friendly materials and sustainable production methods.",
      icon: sustainableIconSrc,
      iconType: "sustainable"
    },
    {
      title: "Community Connection",
      text: "We foster meaningful connections between artisans and customers, creating relationships that go beyond transactions.",
      icon: communityIconSrc,
      iconType: "community"
    }
  ];

  return (
    <section className={styles.values}>
      <h2>Our Core Values</h2>
      <p className={styles.valuesSubtitle}>
        These principles guide everything we do and shape how we support our artisan community
      </p>

      <div className={styles.valuesGrid}>
        {values.map((v) => (
          <div key={v.title} className={styles.card}>
             <Image
               src={v.icon}
               alt={v.title}
               width={40}
               height={40}
               className={styles.cardIcon}
               onError={handleIconError(v.iconType)}
             />
             <h3>{v.title}</h3>
             <p>{v.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
