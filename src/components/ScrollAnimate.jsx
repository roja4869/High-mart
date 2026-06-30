import React from 'react';
import { motion } from 'framer-motion';

// Basic fade-up reveal on scroll for sections
export const ScrollAnimate = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  y = 30, 
  className = "", 
  id = undefined 
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger parent container
export const StaggerContainer = ({ 
  children, 
  delayChildren = 0, 
  staggerChildren = 0.08, 
  className = "", 
  id = undefined 
}) => {
  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.08 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual item within a staggered container
export const StaggerItem = ({ 
  children, 
  duration = 0.5, 
  y = 25, 
  className = "", 
  scaleOnHover = false,
  onClick = undefined
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={scaleOnHover ? { scale: 1.03, transition: { duration: 0.2 } } : undefined}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
