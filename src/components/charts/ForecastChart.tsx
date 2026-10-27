import React from 'react';
import { ForecastHorizon } from '../../types';

interface ForecastChartProps {
  productName: string;
  horizonDays: ForecastHorizon;
  forecastUnits: number;
  lowerRange?: number;
  upperRange?: number;
  actualRecentUnits: number;
  stockOnHand: number;
  seasonalNote?: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  productName,
  horizonDays,
  forecastUnits,
  lowerRange,
  upperRange,
  actualRecentUnits,
  stockOnHand,
  seasonalNote,
}) => {
  const chartHeight = 220;
  const chartWidth = 640;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Max value to scale chart
  const maxValue = Math.max(forecastUnits, upperRange || 0, stockOnHand, actualRecentUnits) * 1.25;

  const getY = (val: number) => chartHeight - paddingY - (val / maxValue) * innerHeight;

  // Timeline points:
  // X0: Past Actual (e.g., -14 to -7 days)
  // X1: Today (0 days) -> Actual recent unit pace & Current Stock on Hand
  // X2: Forecast Horizon (+7, +14, or +30 days)
  const xActual = paddingX + innerWidth * 0.2;
  const xToday = paddingX + innerWidth * 0.45;
  const xForecast = paddingX + innerWidth * 0.85;

  const yStock = getY(stockOnHand);
  const yForecast = getY(forecastUnits);
  const yActual = getY(actualRecentUnits);
  const yUpper = upperRange ? getY(upperRange) : undefined;
  const yLower = lowerRange ? getY(lowerRange) : undefined;

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Demand Forecast Trajectory • {horizonDays}-Day Horizon
          </span>
          <h4 className="text-base font-bold text-neutral-900 mt-0.5">{productName}</h4>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-neutral-400" />
            <span className="text-neutral-600">Past Actuals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 border-dashed" />
            <span className="text-neutral-800 font-semibold">Forecast ({forecastUnits} units)</span>
          </div>
          {lowerRange && upperRange && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-emerald-100 rounded-xs border border-emerald-300" />
              <span className="text-emerald-700 font-medium">
                Confidence Band ({lowerRange}–{upperRange})
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border-dashed" />
            <span className="text-rose-600 font-medium">Current Stock ({stockOnHand})</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[540px] overflow-visible"
        >
          <defs>
            <linearGradient id="rangeBandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background baseline gridlines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const val = Math.round(maxValue * pct);
            const y = chartHeight - paddingY - pct * innerHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Today Divider Line */}
          <line
            x1={xToday}
            y1={paddingY - 5}
            x2={xToday}
            y2={chartHeight - paddingY + 5}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={xToday}
            y={paddingY - 10}
            textAnchor="middle"
            className="text-[10px] font-bold fill-neutral-600 uppercase tracking-wider"
          >
            Today (Oct 27)
          </text>

          {/* Current Stock Horizon line (showing stockout risk gap!) */}
          <line
            x1={xToday}
            y1={yStock}
            x2={xForecast}
            y2={yStock}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={xForecast + 8}
            y={yStock + 3}
            className="text-[10px] fill-rose-600 font-bold"
          >
            Stock: {stockOnHand}
          </text>

          {/* Shaded Confidence Range Polygon */}
          {yUpper && yLower && (
            <polygon
              points={`${xToday},${yActual} ${xForecast},${yUpper} ${xForecast},${yLower}`}
              fill="url(#rangeBandGradient)"
              stroke="#A7F3D0"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Historic line up to Today */}
          <line
            x1={xActual}
            y1={yActual * 1.1}
            x2={xToday}
            y2={yActual}
            stroke="#64748B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx={xActual} cy={yActual * 1.1} r="4" className="fill-slate-600" />
          <circle cx={xToday} cy={yActual} r="5" className="fill-slate-900 stroke-white stroke-2" />

          {/* Forecast trajectory line from Today to +Horizon */}
          <line
            x1={xToday}
            y1={yActual}
            x2={xForecast}
            y2={yForecast}
            stroke="#059669"
            strokeWidth="2.5"
            strokeDasharray="5 3"
            strokeLinecap="round"
          />
          <circle
            cx={xForecast}
            cy={yForecast}
            r="6"
            className="fill-emerald-600 stroke-white stroke-2"
          />

          {/* Labels on Points */}
          <text
            x={xActual}
            y={yActual * 1.1 - 10}
            textAnchor="middle"
            className="text-[11px] font-medium fill-slate-600"
          >
            Past Baseline
          </text>
          <text
            x={xForecast}
            y={yForecast - 10}
            textAnchor="middle"
            className="text-[12px] font-bold fill-emerald-800"
          >
            {forecastUnits} units
          </text>

          {/* Timeline markers on bottom axis */}
          <text
            x={xActual}
            y={chartHeight - 6}
            textAnchor="middle"
            className="text-[10px] fill-neutral-400 font-medium"
          >
            Previous Period
          </text>
          <text
            x={xForecast}
            y={chartHeight - 6}
            textAnchor="middle"
            className="text-[10px] fill-emerald-700 font-bold"
          >
            +{horizonDays} Days Ahead
          </text>
        </svg>
      </div>

      {seasonalNote && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs text-amber-800">
          <span className="font-medium">Seasonal Driver: {seasonalNote}</span>
          <span className="text-[11px] text-amber-700">Source: Historical 2025 shop records</span>
        </div>
      )}
    </div>
  );
};
