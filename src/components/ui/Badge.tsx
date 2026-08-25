import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary' | 'neutral' | 'ostifak';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  icon,
}) => {
  // Normal clean text representation (no badge/pill/tag container box)
  const getVariantStyles = (): { text: string; dot: string } => {
    switch (variant) {
      case 'success':
        return { text: 'text-[#16A34A] font-medium', dot: 'bg-[#16A34A]' };
      case 'warning':
        return { text: 'text-[#CA8A04] font-medium', dot: 'bg-[#CA8A04]' };
      case 'danger':
        return { text: 'text-[#DC2626] font-medium', dot: 'bg-[#DC2626]' };
      case 'info':
        return { text: 'text-[#0284C7] font-medium', dot: 'bg-[#0284C7]' };
      case 'primary':
        return { text: 'text-[#0F172A] font-semibold', dot: 'bg-[#0F172A]' };
      case 'ostifak':
      case 'secondary':
        return { text: 'text-[#059669] font-medium', dot: 'bg-[#059669]' };
      case 'neutral':
      default:
        return { text: 'text-[#64748B] font-medium', dot: 'bg-[#94A3B8]' };
    }
  };

  const style = getVariantStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs select-none ${style.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
