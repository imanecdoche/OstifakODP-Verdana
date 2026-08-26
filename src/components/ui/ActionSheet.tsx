import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLenisModalLock } from '../../lib/lenis';

export interface ActionSheetItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isDestructive?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actions: ActionSheetItem[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  actions,
}) => {
  useLenisModalLock(isOpen);

  // Global Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-end justify-center font-body pointer-events-auto">
          {/* 1. Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs cursor-default"
          />

          {/* 2. Bottom Sheet Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-t-3xl border-t border-[#E2E8F0] shadow-[0_-10px_40px_rgba(15,23,42,0.15)] overflow-hidden z-10 max-h-[85vh] flex flex-col pb-safe"
          >
            {/* Top Drag Handle Indicator */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Header Context (if title provided) */}
            {(title || subtitle) && (
              <div className="px-5 py-3 flex items-start justify-between gap-4 border-b border-[#E2E8F0] shrink-0">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h3 className="text-sm font-bold text-[#0F172A] font-headline truncate">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#64748B] font-body truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 -mr-1"
                  title="Tutup Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions List with Monochrome Black Icons & Thin Dividers */}
            <div className="overflow-y-auto divide-y divide-[#E2E8F0]">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className={`w-full h-14 px-6 flex items-center justify-between text-left transition-colors cursor-pointer active:bg-slate-100 select-none ${
                    action.isDestructive
                      ? 'text-[#0F172A] hover:bg-rose-50/50 active:bg-rose-50'
                      : 'text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {action.icon && (
                      <span className="text-[#0F172A] shrink-0">
                        {action.icon}
                      </span>
                    )}
                    <span className="text-sm font-semibold truncate font-headline">
                      {action.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Cancel / Tutup Button */}
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#E2E8F0] rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.99]"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
