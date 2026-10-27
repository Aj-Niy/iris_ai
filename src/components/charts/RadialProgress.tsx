import React from 'react';

interface RadialProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  percentage,
  size = 140,
  strokeWidth = 12,
  label = `${percentage}%`,
  sublabel,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-800"
          fill="transparent"
        />
        {/* Progress bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient-accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          fill="transparent"
        />
        <defs>
          <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tight text-white">{label}</span>
        {sublabel && <span className="text-[10px] text-neutral-400 font-medium">{sublabel}</span>}
      </div>
    </div>
  );
};
