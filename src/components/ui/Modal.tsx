import React, { useEffect } from 'react';
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity duration-200 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-[#FFFFFF] rounded-t-2xl sm:rounded-xl shadow-[0_-10px_40px_rgba(15,23,42,0.18)] sm:shadow-[0_8px_32px_rgba(15,23,42,0.10)] border-t sm:border border-[#E2E8F0] overflow-hidden transform transition-all duration-200 flex flex-col max-h-[90dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
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
      </div>
    </div>
  );
};
