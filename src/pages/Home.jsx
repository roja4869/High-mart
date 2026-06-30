import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ArrowRight, Star, Percent, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Headphones, Tag, BadgePercent, Mail, ChevronLeft, ChevronRight, Apple, Smartphone, Shirt, BookOpen, ToyBrick, Home as HomeIcon, Sparkles, Trophy, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import './Home.css';

// Meta mapping for category icons and styles to preserve premium aesthetic
const CATEGORY_META = {
  'Groceries': { img: '/assets/3d_icons/groceries.png', grad: 'cat-grad-1' },
  'Electronics': { img: '/assets/3d_icons/electronics.png', grad: 'cat-grad-2' },
  'Fashion': { img: '/assets/3d_icons/fashion.png', grad: 'cat-grad-3' },
  'Books': { img: '/assets/3d_icons/books.png', grad: 'cat-grad-4' },
  'Toys': { img: '/assets/3d_icons/toys.png', grad: 'cat-grad-5' },
  'Home & Kitchen': { img: '/assets/3d_icons/home_kitchen.png', grad: 'cat-grad-6' },
  'Beauty': { img: '/assets/3d_icons/beauty.png', grad: 'cat-grad-7' },
  'Sports': { img: '/assets/3d_icons/sports.png', grad: 'cat-grad-8' }
};

const getCategoryMeta = (name) => {
  return CATEGORY_META[name] || { img: '/assets/3d_icons/groceries.png', grad: 'cat-grad-1' };
};

// Mock Reviews
const REVIEWS = [
  { id: 1, name: 'Sarah Jenkins', stars: 5, comment: 'High Mart has completely changed my grocery shopping! The 2-hour delivery is incredibly reliable, and everything arrives fresh.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { id: 2, name: 'David Miller', stars: 5, comment: 'Bought the wireless headphones during the Flash Sale. The discount was genuine and the quality is outstanding. Highly recommend!', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { id: 3, name: 'Elena Rostova', stars: 4, comment: 'Great customer support! I had to return a cookware set because of sizing, and the refund process was completed in 24 hours without issues.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }
];

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, toggleWishlist, wishlist, addToast, user } = useContext(AppContext);
  const isAdmin = user?.role === 'admin';
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  console.log("[RENDER] Home Component", location);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getProducts();
        if (response.success || Array.isArray(response)) {
          const list = response.products || response;
          const mapped = list.map(p => {
            const isFullUrl = p.image && (p.image.startsWith('http://') || p.image.startsWith('https://') || p.image.startsWith('/uploads/'));
            return {
              ...p,
              image: isFullUrl ? p.image : `/uploads/${p.image}`,
              rating: p.rating || 4.5,
              discount: p.discount || 10
            };
          });
          setProductsList(mapped);
        }
      } catch (err) {
        console.error("Failed to load products from backend:", err.message);
        setProductsList([]);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories in Home:', err.message);
      }
    };

    loadProducts();
    fetchCategories();
  }, []);

  // useEffect(() => {
  //   if (location.state?.scrollTo) {
  //     const el = document.getElementById(location.state.scrollTo);
  //     if (el) {
  //       setTimeout(() => {
  //         el.scrollIntoView({ behavior: 'smooth' });
  //       }, 100);
  //     }
  //     // Clear state so it doesn't re-scroll on refresh
  //     navigate(location.pathname, { replace: true, state: null });
  //   }
  // }, [location, navigate]);

  // 1. Flash Sale Timer (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset to 6 hours when finished
          return { hours: 6, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Reviews Carousel Slider
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveReviewIndex(prev => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  // 3. Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      addToast('Please enter your email address.', 'info');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail.toLowerCase().trim())) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    addToast('Thank you for subscribing to our Newsletter!', 'success');
    setNewsletterEmail('');
  };

  const handleCategoryScroll = (catId) => {
    navigate(`/products?category=${encodeURIComponent(catId)}`);
  };

  return (
    <div className="home-page-container">
      {/* 1. Hero Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="hero-section"
      >
        {/* Floating background elements */}
        <div className="hero-floating-icons">
          <ShoppingCart className="hero-float icon-f1" size={24} />
          <Heart className="hero-float icon-f2" size={20} />
          <Percent className="hero-float icon-f3" size={22} />
        </div>

        <div className="hero-container">
          <div className="hero-text-content animate-fade-in">
            <div className="hero-badge">Big Season Sale</div>
            <h1>Everything You Need, <br/><span>Delivered to Your Doorstep</span></h1>
            <p>Shop daily groceries, smart gadgets, active wear, books, and essential household items at unbeatable prices with 2-hour express dispatch.</p>
            <div className="hero-btn-row">
              <a href="#featured" className="hero-btn-primary">Shop Now <ArrowRight size={18} /></a>
              <a href="#deals" className="hero-btn-secondary">Explore Deals</a>
            </div>
          </div>
          <div className="hero-image-content">
            <img src="/assets/hero_banner_3d.png" alt="High Mart Hero Shopping" className="hero-illustration-img" />
          </div>
        </div>
      </motion.div>

      {/* 2. Categories Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="categories-section section-padding"
        id="categories"
      >
        <div className="section-header-title">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of premium curated collections</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          className="categories-grid"
        >
          {categories.map((cat) => {
            const meta = getCategoryMeta(cat.name);
            const count = productsList.filter(p => p.category === cat.name).length;

            return (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="category-card"
                onClick={() => handleCategoryScroll(cat.name)}
              >
                <div className={"category-icon-box " + meta.grad}>
                  <img src={meta.img} alt={cat.name} className="category-3d-icon" />
                </div>
                <h3>{cat.name}</h3>
                <span className="category-count">{count > 0 ? `${count}+ Products` : 'No Products'}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* 3. Special Offers Section (Flash Sale & Banners) */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="offers-section section-padding"
        id="deals"
      >
        <div className="offers-container">
          {/* Flash Sale Left Banner */}
          <div className="flash-sale-banner">
            <div className="flash-badge"><span className="pulse-dot"></span>Flash Sale</div>
            <h2>Deals of the Day</h2>
            <p>Premium quality items, limited availability. Offers refresh in:</p>
            
            {/* Clock */}
            <div className="countdown-clock">
              <div className="clock-box">
                <span className="time-digit">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="time-lbl">Hours</span>
              </div>
              <span className="clock-colon">:</span>
              <div className="clock-box">
                <span className="time-digit">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="time-lbl">Mins</span>
              </div>
              <span className="clock-colon">:</span>
              <div className="clock-box">
                <span className="time-digit">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="time-lbl">Secs</span>
              </div>
            </div>

            <a href="#featured" className="explore-sale-btn">Grab Deal Now</a>
          </div>

          {/* Special Banner Right */}
          <div className="special-promo-banner">
            <div className="promo-badge">70% OFF</div>
            <h2>Electronics Carnival</h2>
            <p>Upgrade to premium sound & display. Smart accessories, ANC noise-cancelling headphones, activity tracker bands, and smart home tools with extended warranty.</p>
            <div className="promo-discount-card glass-effect">
              <Tag size={20} className="discount-tag-icon" />
              <span>Use Code: <strong>HMTECH70</strong> for extra discounts</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Featured Products Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="products-section section-padding"
        id="featured"
      >
        <div className="section-header-title">
          <h2>Featured Products</h2>
          <p>Explore today's trending premium recommendations</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          className="products-grid"
        >
          {productsList.map(product => {
            const isWishlisted = wishlist.some(item => item.id === product.id);
            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="product-card"
              >
                {/* Image and badges */}
                <div className="product-image-box">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                  <div className="product-badges">
                    <span className="discount-badge">-{product.discount}%</span>
                  </div>
                  {!isAdmin && (
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                      aria-label="Add to Wishlist"
                    >
                      <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} />
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="product-details-content">
                  <span className="product-cat-lbl">{product.category}</span>
                  <h3 className="product-title-txt">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  
                  {/* Stars */}
                  <div className="product-rating-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                    ))}
                    <span className="rating-num">({product.rating})</span>
                  </div>

                  {/* Price Row */}
                  <div className="product-price-action-row">
                    <div className="price-box">
                      <span className="current-price">₹{(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                      <span className="old-price">₹{product.price.toFixed(2)}</span>
                    </div>
                    {isAdmin ? (
                      <span className="admin-view-badge" style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '4px', background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.2)', fontWeight: 'bold' }}>
                        Monitoring
                      </span>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)}
                        className="add-to-cart-btn"
                        aria-label="Add product to Cart"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* 5. Why Choose High Mart Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="benefits-section section-padding"
      >
        <div className="section-header-title">
          <h2>Why Customers Shop with Us</h2>
          <p>Unmatched convenience, security, and quality guarantees</p>
        </div>

        <div className="benefits-grid">
          {/* Card 1: Delivery */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <img src="/assets/3d_icons/truck.png" alt="2h Delivery" className="benefit-3d-icon" />
            </div>
            <h3>Superfast 2h Delivery</h3>
            <p>Free priority dispatch on orders above ₹500. Delivered directly to your room safely.</p>
          </div>

          {/* Card 2: Security */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <img src="/assets/3d_icons/shield.png" alt="Secure Payments" className="benefit-3d-icon" />
            </div>
            <h3>100% Secure Payments</h3>
            <p>We accept Visa, Mastercard, Google Pay, PayPal, and encrypt all payment processing layers.</p>
          </div>

          {/* Card 3: Returns */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <img src="/assets/3d_icons/returns.png" alt="30-Day Returns" className="benefit-3d-icon" />
            </div>
            <h3>Easy 30-Day Returns</h3>
            <p>Not satisfied? Print a return invoice slip and drop off packages for instant credit returns.</p>
          </div>

          {/* Card 4: Support */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <img src="/assets/3d_icons/support.png" alt="24/7 Support" className="benefit-3d-icon" />
            </div>
            <h3>24/7 Dedicated Support</h3>
            <p>Reach customer care via live ticket channels, email inbox, or toll-free hotlines anytime.</p>
          </div>
        </div>
      </motion.div>

      {/* 6. Customer Reviews Carousel Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="reviews-section section-padding"
        id="reviews"
      >
        <div className="section-header-title">
          <h2>What Shoppers Say</h2>
          <p>Read honest feedback from verified buyers across the globe</p>
        </div>

        <div className="reviews-carousel-wrapper">
          <button 
            onClick={() => setActiveReviewIndex(prev => prev === 0 ? REVIEWS.length - 1 : prev - 1)}
            className="carousel-control-btn left"
            aria-label="Previous Review"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="review-active-card glass-effect">
            <div className="reviewer-avatar">
              <img src={REVIEWS[activeReviewIndex].image} alt={REVIEWS[activeReviewIndex].name} />
            </div>
            <div className="reviewer-rating">
              {Array.from({ length: REVIEWS[activeReviewIndex].stars }).map((_, i) => (
                <Star key={i} size={16} fill="#f59e0b" stroke="#f59e0b" />
              ))}
            </div>
            <p className="reviewer-comment">"{REVIEWS[activeReviewIndex].comment}"</p>
            <h4 className="reviewer-name">{REVIEWS[activeReviewIndex].name}</h4>
            <span className="reviewer-tag">Verified Buyer</span>
          </div>

          <button 
            onClick={() => setActiveReviewIndex(prev => prev === REVIEWS.length - 1 ? 0 : prev + 1)}
            className="carousel-control-btn right"
            aria-label="Next Review"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>

      {/* 7. Newsletter Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="newsletter-section section-padding"
      >
        <div className="newsletter-card glass-effect">
          <div className="newsletter-icon-box">
            <Mail size={32} />
          </div>
          <h2>Join the High Mart newsletter</h2>
          <p>Get immediate updates on flash deals, stock arrivals, and members-only 15% VIP coupons.</p>
          
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
