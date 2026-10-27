import React, { useState } from 'react';
import { formatINR } from '../../lib/calculations';

interface DataPoint {
  date: string;
  day: string;
  sales: number;
  transactions: number;
  gp: number;
}

interface SalesTrendChartProps {
  data: DataPoint[];
  height?: number;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, height = 240 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxSales = Math.max(...data.map((d) => d.sales)) * 1.15;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 700;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => height - paddingY - (val / maxSales) * innerHeight;

  // Generate SVG path for line
  const points = data.map((d, i) => `${getX(i)},${getY(d.sales)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M ${getX(0)},${height - paddingY} L ${points.join(' L ')} L ${getX(
    data.length - 1
  )},${height - paddingY} Z`;

  // Grid tick levels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: Math.round(maxSales * pct),
    y: height - paddingY - pct * innerHeight,
  }));

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];
  const activeX = hoverIndex !== null ? getX(hoverIndex) : getX(data.length - 1);
  const activeY = hoverIndex !== null ? getY(activePoint.sales) : getY(activePoint.sales);

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Daily Sales Trend (14-Day Trajectory)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-neutral-900">
              {formatINR(activePoint.sales)}
            </span>
            <span className="text-xs text-neutral-500">
              on {activePoint.date} ({activePoint.transactions} txns • GP: {formatINR(activePoint.gp)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
            <span className="text-neutral-600 font-medium">Daily Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-neutral-600 font-medium">Estimated GP</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-auto min-w-[500px] overflow-visible"
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111827" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#111827" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingX}
                y1={tick.y}
                x2={chartWidth - paddingX}
                y2={tick.y}
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] fill-neutral-400 font-medium"
              >
                ₹{Math.round(tick.val / 1000)}k
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#salesGradient)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#111827"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active hover crosshair and marker */}
          <line
            x1={activeX}
            y1={paddingY}
            x2={activeX}
            y2={height - paddingY}
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle
            cx={activeX}
            cy={activeY}
            r="5"
            className="fill-neutral-900 stroke-white stroke-2"
          />

          {/* Interactive touch/hover invisible overlay bars */}
          {data.map((d, i) => {
            const barWidth = innerWidth / data.length;
            const barX = getX(i) - barWidth / 2;
            return (
              <rect
                key={i}
                x={barX}
                y={0}
                width={barWidth}
                height={height}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* X Axis dates */}
          {data.map((d, i) => {
            // Show every other label on smaller width
            if (i % 2 !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-neutral-500 font-medium"
              >
                {d.date}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
