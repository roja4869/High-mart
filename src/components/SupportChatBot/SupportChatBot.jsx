import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { supportService } from '../../services/supportService';
import './SupportChatBot.css';

const SupportChatBot = () => {
  const { user, theme } = useContext(AppContext);
  const navigate = useNavigate();

  // Chat window open state
  const [isOpen, setIsOpen] = useState(false);
  
  // Message history
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi there! I'm your High-Mart Virtual Assistant. 🛍️ How can I help you today? You can search for products, track your orders, or ask about our return policy.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  // Input message state
  const [inputText, setInputText] = useState('');
  
  // Status flags
  const [isTyping, setIsTyping] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLiveAgent, setIsLiveAgent] = useState(false);
  const [agentName, setAgentName] = useState('Agent Sarah');
  
  // Notification badge (for unread welcome message or subsequent messages when closed)
  const [hasBadge, setHasBadge] = useState(true);

  // Scroll ref
  const chatEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasBadge(false); // Clear badge when chat is opened
    }
  }, [messages, isOpen, isTyping, isTransferring]);

  // Open chatbot toggle
  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setHasBadge(false);
  };

  // Predefined replies from mock Live Agent
  const getLiveAgentReply = (userText) => {
    const text = userText.toLowerCase();
    if (text.includes('order') || text.includes('where') || text.includes('track') || text.includes('package')) {
      return `I see order details under your email. It has been processed and is currently with our shipping partner. It should be delivered in 2-3 business days!`;
    }
    if (text.includes('discount') || text.includes('coupon') || text.includes('promo')) {
      return `I've generated a special live-support code for you: **LIVESUPPORT10**. Enter this code during checkout to save 10% on your purchase!`;
    }
    if (text.includes('return') || text.includes('refund') || text.includes('damaged') || text.includes('wrong')) {
      return `I can definitely help with your return request. Could you please specify the items you want to return and your Order ID so I can generate a pre-paid return shipping label?`;
    }
    if (text.includes('cancel') || text.includes('stop')) {
      return `Sure. I can process order cancellations if the order hasn't shipped yet. What is your Order ID?`;
    }
    return `That sounds like something we can definitely look into. Let me check our system log for you. One moment, please.`;
  };

  // Simulate Live Agent transfer sequence
  const startLiveAgentTransfer = () => {
    setIsTransferring(true);
    
    setTimeout(() => {
      setIsTransferring(false);
      setIsLiveAgent(true);
      
      // System message
      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `Support agent Sarah joined the session.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Sarah's greeting after 1 second
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: `agent-greet-${Date.now()}`,
              sender: 'agent',
              text: `Hello! My name is Sarah. I'm a live customer representative here to help you. How can I assist you today?`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 1200);
      }, 800);

    }, 2500);
  };

  // Disconnect live agent
  const endLiveAgentSession = () => {
    setIsLiveAgent(false);
    setIsTransferring(false);
    
    setMessages(prev => [
      ...prev,
      {
        id: `sys-left-${Date.now()}`,
        sender: 'system',
        text: `Support agent Sarah left the session.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: `bot-back-${Date.now()}`,
        sender: 'bot',
        text: "I am back online! I can search products, track orders, or answer common FAQs. Let me know what you need.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Handle message sending
  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Create user message object
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // If live agent mode is active, handle mock typing and response
    if (isLiveAgent) {
      if (textToSend.toLowerCase().includes('cancel handoff') || textToSend.toLowerCase().includes('exit') || textToSend.toLowerCase().includes('bye')) {
        endLiveAgentSession();
        return;
      }
      setIsTyping(true);
      const delay = Math.max(1000, 1000 + Math.random() * 1500);
      setTimeout(() => {
        setIsTyping(false);
        const agentReply = getLiveAgentReply(textToSend);
        setMessages(prev => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            sender: 'agent',
            text: agentReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, delay);
      return;
    }

    // Call backend API for virtual assistant bot response
    setIsTyping(true);
    try {
      const data = await supportService.sendChatMessage(textToSend);
      
      setTimeout(() => {
        setIsTyping(false);
        
        // Add bot message
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.response,
            options: data.options,
            products: data.data?.products,
            orders: data.data?.orders,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        // Trigger agent transfer if requested
        if (data.transferToAgent) {
          startLiveAgentTransfer();
        }
      }, 700);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'bot',
          text: "I'm having trouble connecting to the support server. Please make sure you're connected to the internet and try again.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  // Navigating to product detail from chat cards
  const viewProduct = (prodId) => {
    setIsOpen(false);
    navigate(`/product/${prodId}`);
  };

  return (
    <div className={`support-chatbot-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
      
      {/* Floating Toggle Button */}
      <button 
        className={`chatbot-toggle-button ${isOpen ? 'active' : ''}`} 
        onClick={toggleChat}
        title="Customer Support Chat"
        id="support-chatbot-toggle"
      >
        {isOpen ? (
          // Close Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          // Message Chat Icon
          <div className="icon-pulse-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            {hasBadge && <span className="chatbot-badge"></span>}
          </div>
        )}
      </button>

      {/* Chat Window Box */}
      <div className={`chatbot-window glass-effect ${isOpen ? 'open' : ''}`}>
        
        {/* Chat Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <div className={`status-indicator ${isLiveAgent ? 'live-agent' : 'bot-online'}`}></div>
            <div>
              <h3>{isLiveAgent ? agentName : "High-Mart Assistant"}</h3>
              <p>{isLiveAgent ? "Live Representative" : "Virtual Shopper bot"}</p>
            </div>
          </div>
          <div className="header-actions">
            {isLiveAgent && (
              <button onClick={endLiveAgentSession} className="exit-agent-btn" title="End human support session">
                Exit Agent
              </button>
            )}
            <button className="header-close-btn" onClick={() => setIsOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Chat History Messages Thread */}
        <div className="chatbot-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              
              {/* Profile Avatars */}
              {msg.sender !== 'user' && msg.sender !== 'system' && (
                <div className="avatar">
                  {msg.sender === 'agent' ? '👩‍💼' : '🤖'}
                </div>
              )}

              {/* Message bubble */}
              {msg.sender === 'system' ? (
                <div className="system-message">
                  <span>{msg.text}</span>
                </div>
              ) : (
                <div className="message-bubble">
                  <p className="message-text">{msg.text}</p>
                  
                  {/* Rendering Structured Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="products-card-list">
                      {msg.products.map(p => (
                        <div key={p.id} className="chat-product-card" onClick={() => viewProduct(p.id)}>
                          <img src={p.image} alt={p.name} className="chat-product-img" />
                          <div className="chat-product-details">
                            <h4 className="chat-product-name">{p.name}</h4>
                            <div className="chat-product-footer">
                              <span className="chat-product-price">${parseFloat(p.price).toFixed(2)}</span>
                              <span className={`chat-product-stock ${p.stock > 0 ? 'in' : 'out'}`}>
                                {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rendering Structured Order Status Cards */}
                  {msg.orders && msg.orders.length > 0 && (
                    <div className="orders-card-list">
                      {msg.orders.map(order => (
                        <div key={order.id} className="chat-order-card">
                          <div className="chat-order-header">
                            <span className="order-num">#{order.orderId}</span>
                            <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="chat-order-body">
                            <p className="order-date-label">Placed: {new Date(order.date).toLocaleDateString()}</p>
                            <p className="order-total-label">Total: <strong>${parseFloat(order.totalAmount).toFixed(2)}</strong></p>
                            
                            <div className="order-items-preview">
                              {order.items && order.items.map((item, idx) => (
                                <div key={idx} className="preview-item-row">
                                  <span>{item.name || item.productName}</span>
                                  <span>x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="message-time">{msg.time}</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-row bot typing-wrapper">
              <div className="avatar">🤖</div>
              <div className="message-bubble typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {/* Live Agent Transfer State Indicator */}
          {isTransferring && (
            <div className="transfer-indicator animate-fade-in">
              <div className="spinner"></div>
              <p>Connecting to a live agent, please hold...</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick replies pill options */}
        {!isTransferring && (
          <div className="chatbot-quick-replies">
            {(messages[messages.length - 1]?.options || ["📦 Track Orders", "🔍 Search Products", "💰 Refund Policy", "💬 Speak to Agent"]).map((opt, index) => (
              <button 
                key={index} 
                className="quick-reply-pill"
                onClick={() => {
                  let query = opt;
                  // Strip emoji for query matching if necessary, but backend is smart enough
                  if (opt === "Cancel Handoff") {
                    endLiveAgentSession();
                    return;
                  }
                  if (opt === "Log In") {
                    setIsOpen(false);
                    navigate('/login');
                    return;
                  }
                  if (opt === "🔍 Browse Products") {
                    setIsOpen(false);
                    navigate('/products');
                    return;
                  }
                  handleSendMessage(query);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Input Form Footer */}
        <div className="chatbot-footer">
          <input
            type="text"
            placeholder={isTransferring ? "Connecting..." : "Type your message here..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isTransferring}
          />
          <button 
            onClick={() => handleSendMessage(inputText)} 
            disabled={isTransferring || !inputText.trim()}
            className="send-button"
            title="Send Message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SupportChatBot;
