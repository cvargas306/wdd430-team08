import { Mail, Phone, MapPin, Facebook, Instagram, X } from "lucide-react";
import styles from "./footer.module.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          {/* Logo Column */}
          <div className={styles.column}>
            <div className={styles.logo}>
              <Image
                src="/logo-loom1.png"
                alt="Loom & Thread Logo"
                width={100}
                height={100}
              />
            </div>
            <p className={styles.text}>
              Connecting artisans with art lovers worldwide.
              <br />
              Supporting sustainable, creative craftsmanship.
            </p>
          </div>

          {/* Community Column */}
          <div className={styles.column}>
            <h3 className={styles.title}>Community</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#">Become a Seller</a>
              </li>
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Sustainability</a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className={styles.column}>
            <h3 className={styles.title}>Contact</h3>
            <div className={styles.contactItem}>
              <Mail size={16} /> hello@handcraftedhaven.com
            </div>
            <div className={styles.contactItem}>
              <Phone size={16} /> +1 (555) 123-4567
            </div>
            <div className={styles.contactItem}>
              <MapPin size={16} /> United States
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>© 2025 Loom & Tread Handcraft</p>
          <div className={styles.socials}>
            <Facebook className={styles.icon} size={18} />
            <Instagram className={styles.icon} size={18} />
            <X className={styles.icon} size={18} />
          </div>
        </div>
      </div>
    </footer>
  );
}
