import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  transitionKey?: string;
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ transitionKey, children }) => (
  <motion.div
    key={transitionKey}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);
