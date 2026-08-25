import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'sage' | 'tertiary' | 'ghost' | 'destructive' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  // Base button styles aligned with Verdana Health & Emil Kowalski active-press
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-160 ease-out cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] select-none';

  const variantStyles: Record<string, string> = {
    // Primary: #0F172A fill, #FFFFFF text, #020617 hover fill
    primary: 'bg-[#0F172A] hover:bg-[#020617] text-white border-0 shadow-[0_1px_3px_rgba(15,23,42,0.08)]',
    
    // Secondary: transparent fill, #0F172A text, 1px #0F172A border, #0F172A0A hover
    secondary: 'bg-transparent text-[#0F172A] border border-[#0F172A] hover:bg-[#0F172A]/[0.04]',
    outline: 'bg-transparent text-[#0F172A] border border-[#0F172A] hover:bg-[#0F172A]/[0.04]',
    
    // Tertiary / Sage: #059669 fill, #FFFFFF text, #047857 hover fill
    sage: 'bg-[#059669] hover:bg-[#047857] text-white border-0 shadow-[0_1px_3px_rgba(5,150,105,0.2)]',
    tertiary: 'bg-[#059669] hover:bg-[#047857] text-white border-0 shadow-[0_1px_3px_rgba(5,150,105,0.2)]',
    
    // Ghost: transparent fill, #475569 text, #F1F5F9 hover fill
    ghost: 'bg-transparent text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] border-0',
    
    // Destructive: #EF4444 fill, #FFFFFF text, #DC2626 hover fill
    destructive: 'bg-[#EF4444] hover:bg-[#DC2626] text-white border-0 shadow-[0_1px_3px_rgba(239,68,68,0.2)]',
  };

  // Strict 8-Point Grid Sizes: sm (32px, px-14), md (40px, px-22), lg (48px, px-28)
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3.5 text-xs gap-1.5 leading-none',
    md: 'h-10 px-5 text-sm gap-2 leading-none',
    lg: 'h-12 px-7 text-base gap-2.5 leading-none',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
