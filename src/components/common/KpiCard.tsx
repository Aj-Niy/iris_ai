import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral' | 'warning';
  };
  icon?: LucideIcon;
  onClick?: () => void;
  accent?: 'default' | 'dark';
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  onClick,
  accent = 'default',
  tooltip,
}) => {
  const isDark = accent === 'dark';

  const badgeColors = {
    positive: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    negative: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  return (
    <div
      onClick={onClick}
      title={tooltip}
      className={`rounded-2xl p-5 transition-all duration-200 ${
        isDark
          ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-elevated border border-neutral-700/60'
          : 'bg-white text-neutral-900 shadow-subtle border border-neutral-200/80 hover:border-neutral-300'
      } ${onClick ? 'cursor-pointer hover:shadow-card active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-semibold tracking-wider uppercase ${
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-50 text-neutral-600 border border-neutral-100'
            }`}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</span>
        {badge && (
          <span
            className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${badgeColors[badge.variant]}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
