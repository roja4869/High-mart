import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* Column 1: Brand Info */}
        <div className="footer-column brand-summary-column">
          <div className="footer-logo">
            <div className="footer-logo-wrapper">
              <ShoppingBag size={20} />
            </div>
            <span>High Mart</span>
          </div>
          <p className="brand-description">
            Your premium e-commerce destination. Discover quality groceries, cutting-edge electronics, trendy fashion apparel, and home essentials. Everything you need, delivered right to your doorstep.
          </p>
          <div className="social-icons-wrapper">
            <a href="#" className="social-link-btn" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="social-link-btn" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="#" className="social-link-btn" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="social-link-btn" aria-label="Youtube">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links-list">
            <li><Link to="/">Home Page</Link></li>
            <li><a href="#deals">Deals & Offers</a></li>
            <li><a href="#featured">Featured Products</a></li>
            <li><a href="#reviews">Customer Reviews</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3: Categories */}
        <div className="footer-column">
          <h3>Categories</h3>
          <ul className="footer-links-list">
            <li><a href="#categories">Groceries & Foods</a></li>
            <li><a href="#categories">Consumer Electronics</a></li>
            <li><a href="#categories">Fashion & Clothing</a></li>
            <li><a href="#categories">Home & Kitchen</a></li>
            <li><a href="#categories">Sports & Fitness</a></li>
          </ul>
        </div>

        {/* Column 4: Contact & Support */}
        <div className="footer-column">
          <h3>Contact Support</h3>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>123 Shopping Plaza, Retail Ave, NY 10001</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <span>+1 (800) 555-MART (6278)</span>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <span>support@highmart.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="copyright-bar">
        <div className="copyright-container">
          <p>&copy; 2026 High Mart Inc. All rights reserved.</p>
          <div className="copyright-policies">
            <a href="#">Privacy Policy</a>
            <span>•</span>
            <a href="#">Terms & Conditions</a>
            <span>•</span>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
