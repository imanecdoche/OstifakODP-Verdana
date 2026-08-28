import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLenisModalLock } from '../../lib/lenis';
import { panelStack } from '../../lib/panelStackManager';

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
  id?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  actions,
  id,
}) => {
  useLenisModalLock(isOpen);

  // Cache last active content so text/actions don't vanish mid-spring-exit-animation
  const lastTitleRef = React.useRef(title);
  const lastSubtitleRef = React.useRef(subtitle);
  const lastActionsRef = React.useRef(actions);

  if (isOpen) {
    if (title) lastTitleRef.current = title;
    if (subtitle) lastSubtitleRef.current = subtitle;
    if (actions && actions.length > 0) lastActionsRef.current = actions;
  }

  const activeTitle = title || lastTitleRef.current;
  const activeSubtitle = subtitle || lastSubtitleRef.current;
  const activeActions = (actions && actions.length > 0) ? actions : lastActionsRef.current;

  // Register into global panel stack
  useEffect(() => {
    if (isOpen) {
      const sheetId = id || `action-sheet-${(title || 'menu').toLowerCase().replace(/\s+/g, '-')}`;
      const unregister = panelStack.push(sheetId, onClose);
      return () => unregister();
    }
  }, [isOpen, onClose, id, title]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-end justify-center font-body pointer-events-auto">
          {/* 1. Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 cursor-default"
          />

          {/* 2. Bottom Sheet Panel (Spring Entry & Spring Exit Animation) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 300,
              mass: 0.8,
            }}
            onClick={(e) => e.stopPropagation()}
            data-bottom-sheet
            className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-t-3xl border-t border-[#E2E8F0] shadow-[0_-10px_40px_rgba(15,23,42,0.18)] overflow-hidden z-10 max-h-[85vh] flex flex-col"
          >
            {/* Top Drag Handle Indicator */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Header Context (if title provided) */}
            {(activeTitle || activeSubtitle) && (
              <div className="px-5 py-3 flex items-start justify-between gap-4 border-b border-[#E2E8F0] shrink-0">
                <div className="min-w-0 flex-1">
                  {activeTitle && (
                    <h3 className="text-sm font-bold text-[#0F172A] font-headline truncate">
                      {activeTitle}
                    </h3>
                  )}
                  {activeSubtitle && (
                    <p className="text-xs text-[#64748B] font-body truncate mt-0.5">
                      {activeSubtitle}
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
              {activeActions.map((action, idx) => (
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

            {/* Bottom Cancel / Tutup Button with Extra Bottom Padding for Mobile Navbars */}
            <div data-sheet-actions className="pt-2 pb-8 px-4 sm:pb-5 bg-[#F8FAFC] border-t border-[#E2E8F0] shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer uppercase tracking-wider"
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
