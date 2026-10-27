import React from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'dark';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string }> = {
    neutral: { bg: 'bg-neutral-100', text: 'text-neutral-700 border-neutral-200', dotColor: 'bg-neutral-400' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-800 border-amber-200', dotColor: 'bg-amber-500' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-700 border-rose-200', dotColor: 'bg-rose-500' },
    info: { bg: 'bg-sky-50', text: 'text-sky-700 border-sky-200', dotColor: 'bg-sky-500' },
    dark: { bg: 'bg-neutral-900', text: 'text-white border-neutral-900', dotColor: 'bg-emerald-400' },
  };

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />}
      {children}
    </span>
  );
};
