"use client";

import { useState } from "react";
import styles from "./contact.module.css";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ChevronDown } from "lucide-react";

// FAQ Item Component with dropdown
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem}>
      <button
        className={styles.faqQuestionButton}
        onClick={() => setIsOpen(!isOpen)}
        {...(isOpen ? { 'aria-expanded': true } : { 'aria-expanded': false })}
      >
        <h3 className={styles.faqQuestion}>{question}</h3>
        <ChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          size={24}
        />
      </button>
      <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ""}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We&apos;ll get back to you soon.");
    setFormData({ fullName: "", email: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>We&apos;d Love To Hear From You</h1>
        <p className={styles.heroSubtitle}>
          Have questions about Handcrafted Haven? Interested in becoming a
          seller? Or just want to share your thoughts? Drop us a message and
          we&apos;ll get back to you soon!
        </p>
      </section>

      {/* Main Content */}
      <section className={styles.content}>
        <div className={styles.container}>
          {/* Contact Form */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.label}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  className={styles.textarea}
                  rows={6}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </div>

          {/* Sidebar with Additional Info */}
          <div className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Response Times</h3>
              <p className={styles.infoText}>
                We typically reply to submissions within 24-48 hours during
                business days. Thanks for your patience!
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Interested in Selling?</h3>
              <p className={styles.infoText}>
                Join our community of artisans! Visit our Become a Seller page
                for more information on how to start selling your creations on
                our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Reach Us */}
      <section className={styles.otherWays}>
        <h2 className={styles.sectionTitle}>Other Ways to Reach Us</h2>
        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div className={styles.iconWrapper}>
              <MapPin size={32} />
            </div>
            <h3 className={styles.contactCardTitle}>Visit Us</h3>
            <p className={styles.contactCardText}>123 Artisan Lane</p>
            <p className={styles.contactCardText}>United States</p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.iconWrapper}>
              <Mail size={32} />
            </div>
            <h3 className={styles.contactCardTitle}>Email Us</h3>
            <p className={styles.contactCardText}>hello@handcraftedhaven.com</p>
            <p className={styles.contactCardText}>
              sales@handcraftedhaven.com
            </p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.iconWrapper}>
              <Phone size={32} />
            </div>
            <h3 className={styles.contactCardTitle}>Call Us</h3>
            <p className={styles.contactCardText}>+1 (555) 123-4567</p>
            <p className={styles.contactCardText}>Monday-Friday</p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.iconWrapper}>
              <Clock size={32} />
            </div>
            <h3 className={styles.contactCardTitle}>Business Hours</h3>
            <p className={styles.contactCardText}>Monday-Friday:</p>
            <p className={styles.contactCardText}>9am-5pm EST</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
<section className={styles.faq}>
  <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
  <p className={styles.faqSubtitle}>
    Can&apos;t find the answer you&apos;re looking for? Contact us directly and
    we&apos;ll be happy to help!
  </p>
  <div className={styles.faqGrid}>
    <FAQItem
      question="What makes Handcrafted Haven different?"
      answer="We focus exclusively on authentic, handcrafted products. Every item is crafted with care, supporting sustainable materials and artisan preservation of traditional craftsmanship."
    />
    
    <FAQItem
      question="How long does shipping typically take?"
      answer="Shipping times vary by artisan and location. Most items ship within 3-5 business days, with delivery typically taking 5-10 business days within the United States."
    />
    
    <FAQItem
      question="What is your return policy?"
      answer="We offer a 30-day return policy for most items. Since each product is handmade, please review individual seller return policies before purchasing."
    />
  </div>
</section>
    </main>
  );
}