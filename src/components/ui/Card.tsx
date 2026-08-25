import React from 'react';

export type CardVariant = 'default' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  headerTitle?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  headerTitle,
  onClick,
  hoverable = false,
}) => {
  // 8px radius, white surface, pure 8-point grid padding
  const variantStyles =
    variant === 'elevated'
      ? 'bg-[#FFFFFF] border-0 shadow-[0_4px_16px_rgba(15,23,42,0.07)] rounded-md'
      : 'bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_2px_6px_rgba(15,23,42,0.05)] rounded-md';

  const hoverStyles = hoverable
    ? 'transition-all duration-160 ease-out hover:border-[#0F172A] hover:shadow-[0_4px_16px_rgba(15,23,42,0.07)] cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`overflow-hidden ${variantStyles} ${hoverStyles} ${className}`}
    >
      {headerTitle && (
        <div className="bg-[#0F172A] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wide">
          {headerTitle}
        </div>
      )}
      {children}
    </div>
  );
};
