import React from 'react';

interface IconBoxProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  bgClass?: string;
  className?: string;
}

export const IconBox: React.FC<IconBoxProps> = ({
  children,
  size = 'md',
  bgClass = 'bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]',
  className = '',
}) => {
  // Strict 8-Point Grid sizes: sm (32px), md (40px), lg (48px), radius 8px (rounded-md)
  const sizeStyles: Record<string, string> = {
    sm: 'w-8 h-8 rounded-md',
    md: 'w-10 h-10 rounded-md',
    lg: 'w-12 h-12 rounded-md',
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${sizeStyles[size]} ${bgClass} ${className}`}
    >
      {children}
    </div>
  );
};
