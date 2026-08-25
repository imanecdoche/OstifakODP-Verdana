import React, { useEffect } from 'react';
import { X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity duration-200 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-[#FFFFFF] rounded-lg shadow-[0_8px_32px_rgba(15,23,42,0.10)] border border-[#E2E8F0] overflow-hidden transform transition-all duration-200 scale-100 opacity-100 flex flex-col my-auto max-h-[92dvh] sm:max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-headline">{title}</h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5 font-body">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer active:scale-[0.97]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ScrollArea
          className="flex-1 min-h-0"
          viewportClassName="p-4 sm:p-6 pb-12 sm:pb-6"
          topOffset="top-4"
          bottomOffset="bottom-4"
        >
          {children}
        </ScrollArea>
      </div>
    </div>
  );
};
