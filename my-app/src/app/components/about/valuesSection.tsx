import styles from "./about.module.css";
import Image from "next/image";


export default function ValuesSection() {
  const values = [
    {
      title: "Creativity First",
      text: "We celebrate the boundless creativity of artisans, providing them with a platform to showcase their unique vision and skills to the world.",
      icon: "/creativity-icon.webp"
    },
    {
      title: "Sustainable Practices",
      text: "We're committed to environmental responsibility. Our platform features makers who prioritize eco-friendly materials and sustainable production methods.",
      icon: "/sustainable-icon.webp"
    },
    {
      title: "Community Connection",
      text: "We foster meaningful connections between artisans and customers, creating relationships that go beyond transactions.",
      icon: "/community-icon.webp"
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
            />
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
