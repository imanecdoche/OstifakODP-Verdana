import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenisModalLock } from '../../lib/lenis';
import { ScrollArea } from './ScrollArea';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useLenisModalLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden pointer-events-auto font-body"
        >
          {/* 1. Backdrop (Clicking backdrop closes the sheet) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs cursor-default"
          />

          {/* 2. Sheet Panel (Spring Entry & Spring Exit Animation) */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 320,
              mass: 0.8,
            }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidth} bg-[#FFFFFF] rounded-t-2xl sm:rounded-xl shadow-[0_-10px_40px_rgba(15,23,42,0.18)] sm:shadow-[0_8px_32px_rgba(15,23,42,0.10)] border-t sm:border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] z-10`}
          >
            {/* Mobile Top Drag Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#F8FAFC]">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-headline">{title}</h3>
              {subtitle && <p className="text-xs text-[#64748B] mt-0.5 font-body">{subtitle}</p>}
            </div>

            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-4 sm:p-6 pb-8 sm:pb-6"
              topOffset="top-4"
              bottomOffset="bottom-4"
            >
              {children}
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
