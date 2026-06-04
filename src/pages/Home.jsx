import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { ArrowRight, Star, Percent, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Headphones, Tag, BadgePercent, Mail, ChevronLeft, ChevronRight, Apple, Smartphone, Shirt, BookOpen, ToyBrick, Home as HomeIcon, Sparkles, Trophy } from 'lucide-react';
import './Home.css';

// Mock Products Data
const FEATURED_PRODUCTS = [
  { id: 4, name: 'Premium Organic Almonds (1kg)', category: 'Groceries', price: 14.99, rating: 4.8, discount: 10, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80' },
  { id: 1, name: 'Wireless Over-Ear ANC Headphones', category: 'Electronics', price: 129.99, rating: 4.9, discount: 20, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { id: 2, name: 'Minimalist Quartz Leather Watch', category: 'Fashion', price: 79.99, rating: 4.6, discount: 15, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { id: 5, name: 'Ergonomic Adjustable Office Chair', category: 'Home & Kitchen', price: 149.99, rating: 4.8, discount: 12, image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400&q=80' },
  { id: 3, name: 'Smart Fitness Tracker & HR Monitor', category: 'Electronics', price: 49.99, rating: 4.5, discount: 25, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80' },
  { id: 6, name: 'Non-Stick Ceramic Cookware Set', category: 'Home & Kitchen', price: 89.99, rating: 4.7, discount: 30, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&q=80' },
  { id: 7, name: 'Organic Lavender Soothing Lotion', category: 'Beauty', price: 18.99, rating: 4.6, discount: 5, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80' },
  { id: 8, name: 'Vintage Waterproof Canvas Backpack', category: 'Fashion', price: 59.99, rating: 4.7, discount: 10, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' }
];

// Mock Reviews
const REVIEWS = [
  { id: 1, name: 'Sarah Jenkins', stars: 5, comment: 'High Mart has completely changed my grocery shopping! The 2-hour delivery is incredibly reliable, and everything arrives fresh.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { id: 2, name: 'David Miller', stars: 5, comment: 'Bought the wireless headphones during the Flash Sale. The discount was genuine and the quality is outstanding. Highly recommend!', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { id: 3, name: 'Elena Rostova', stars: 4, comment: 'Great customer support! I had to return a cookware set because of sizing, and the refund process was completed in 24 hours without issues.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, toggleWishlist, wishlist, addToast } = useContext(AppContext);
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getProducts();
        if (response.success || Array.isArray(response)) {
          const list = response.products || response;
          const mapped = list.map(p => {
            const isFullUrl = p.image && (p.image.startsWith('http://') || p.image.startsWith('https://'));
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
        console.warn("Failed to load products from backend, falling back to static featured products.", err.message);
        const mappedFallback = FEATURED_PRODUCTS.map(p => ({
          ...p,
          rating: p.rating || 4.5,
          discount: p.discount || 10
        }));
        setProductsList(mappedFallback);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      // Clear state so it doesn't re-scroll on refresh
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

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
      <section className="hero-section">
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
            <img src="/assets/hero_banner.png" alt="High Mart Hero Shopping" className="hero-illustration-img" />
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="categories-section section-padding" id="categories">
        <div className="section-header-title">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of premium curated collections</p>
        </div>

        <div className="categories-grid">
          {/* Card 1: Groceries */}
          <div className="category-card" onClick={() => handleCategoryScroll('Groceries')}>
            <div className="category-icon-box cat-grad-1">
              <Apple size={28} />
            </div>
            <h3>Groceries</h3>
            <span className="category-count">1,200+ Products</span>
          </div>

          {/* Card 2: Electronics */}
          <div className="category-card" onClick={() => handleCategoryScroll('Electronics')}>
            <div className="category-icon-box cat-grad-2">
              <Smartphone size={28} />
            </div>
            <h3>Electronics</h3>
            <span className="category-count">850+ Products</span>
          </div>

          {/* Card 3: Fashion */}
          <div className="category-card" onClick={() => handleCategoryScroll('Fashion')}>
            <div className="category-icon-box cat-grad-3">
              <Shirt size={28} />
            </div>
            <h3>Fashion</h3>
            <span className="category-count">3,100+ Products</span>
          </div>

          {/* Card 4: Books */}
          <div className="category-card" onClick={() => handleCategoryScroll('Books')}>
            <div className="category-icon-box cat-grad-4">
              <BookOpen size={28} />
            </div>
            <h3>Books</h3>
            <span className="category-count">450+ Products</span>
          </div>

          {/* Card 5: Toys */}
          <div className="category-card" onClick={() => handleCategoryScroll('Toys')}>
            <div className="category-icon-box cat-grad-5">
              <ToyBrick size={28} />
            </div>
            <h3>Toys</h3>
            <span className="category-count">620+ Products</span>
          </div>

          {/* Card 6: Home & Kitchen */}
          <div className="category-card" onClick={() => handleCategoryScroll('Home & Kitchen')}>
            <div className="category-icon-box cat-grad-6">
              <HomeIcon size={28} />
            </div>
            <h3>Home & Kitchen</h3>
            <span className="category-count">940+ Products</span>
          </div>

          {/* Card 7: Beauty */}
          <div className="category-card" onClick={() => handleCategoryScroll('Beauty')}>
            <div className="category-icon-box cat-grad-7">
              <Sparkles size={28} />
            </div>
            <h3>Beauty</h3>
            <span className="category-count">1,100+ Products</span>
          </div>

          {/* Card 8: Sports */}
          <div className="category-card" onClick={() => handleCategoryScroll('Sports')}>
            <div className="category-icon-box cat-grad-8">
              <Trophy size={28} />
            </div>
            <h3>Sports</h3>
            <span className="category-count">380+ Products</span>
          </div>
        </div>
      </section>

      {/* 3. Special Offers Section (Flash Sale & Banners) */}
      <section className="offers-section section-padding" id="deals">
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
      </section>

      {/* 4. Featured Products Section */}
      <section className="products-section section-padding" id="featured">
        <div className="section-header-title">
          <h2>Featured Products</h2>
          <p>Explore today's trending premium recommendations</p>
        </div>

        <div className="products-grid">
          {productsList.map(product => {
            const isWishlisted = wishlist.some(item => item.id === product.id);
            return (
              <div key={product.id} className="product-card">
                {/* Image and badges */}
                <div className="product-image-box">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                  <div className="product-badges">
                    <span className="discount-badge">-{product.discount}%</span>
                  </div>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} />
                  </button>
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
                    <button 
                      onClick={() => addToCart(product)}
                      className="add-to-cart-btn"
                      aria-label="Add product to Cart"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Why Choose High Mart Section */}
      <section className="benefits-section section-padding">
        <div className="section-header-title">
          <h2>Why Customers Shop with Us</h2>
          <p>Unmatched convenience, security, and quality guarantees</p>
        </div>

        <div className="benefits-grid">
          {/* Card 1: Delivery */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <Truck size={24} />
            </div>
            <h3>Superfast 2h Delivery</h3>
            <p>Free priority dispatch on orders above ₹500. Delivered directly to your room safely.</p>
          </div>

          {/* Card 2: Security */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3>100% Secure Payments</h3>
            <p>We accept Visa, Mastercard, Google Pay, PayPal, and encrypt all payment processing layers.</p>
          </div>

          {/* Card 3: Returns */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <RotateCcw size={24} />
            </div>
            <h3>Easy 30-Day Returns</h3>
            <p>Not satisfied? Print a return invoice slip and drop off packages for instant credit returns.</p>
          </div>

          {/* Card 4: Support */}
          <div className="benefit-card glass-effect">
            <div className="benefit-icon-wrapper">
              <Headphones size={24} />
            </div>
            <h3>24/7 Dedicated Support</h3>
            <p>Reach customer care via live ticket channels, email inbox, or toll-free hotlines anytime.</p>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews Carousel Section */}
      <section className="reviews-section section-padding" id="reviews">
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
      </section>

      {/* 7. Newsletter Section */}
      <section className="newsletter-section section-padding">
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
      </section>
    </div>
  );
};

export default Home;
