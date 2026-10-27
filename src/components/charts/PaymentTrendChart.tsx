import React from 'react';

interface PaymentPoint {
  date: string;
  success: number;
  failed: number;
  rate: number;
}

interface PaymentTrendChartProps {
  data: PaymentPoint[];
}

export const PaymentTrendChart: React.FC<PaymentTrendChartProps> = ({ data }) => {
  const chartHeight = 180;
  const chartWidth = 600;
  const paddingX = 35;
  const paddingY = 20;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Max transactions in any single bucket
  const maxTxn = Math.max(...data.map((d) => d.success + d.failed)) * 1.15;

  const getX = (idx: number) => paddingX + (idx / (data.length - 1)) * innerWidth;
  const getY = (val: number) => chartHeight - paddingY - (val / maxTxn) * innerHeight;

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Payment Volume & Success Rate (30-Day Trend)
          </span>
          <h4 className="text-sm font-bold text-neutral-900 mt-0.5">
            Paytm QR, RuPay POS & Wallet Collection History
          </h4>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span className="text-neutral-600 font-medium">Successful</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span className="text-neutral-600 font-medium">Failed</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[500px] overflow-visible"
        >
          {/* Subtle gridlines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = chartHeight - paddingY - pct * innerHeight;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            );
          })}

          {/* Stacked Bars for each date point */}
          {data.map((d, i) => {
            const x = getX(i) - 9;
            const barWidth = 18;
            const ySuccessTop = getY(d.success);
            const successHeight = chartHeight - paddingY - ySuccessTop;
            const failedHeight = (d.failed / maxTxn) * innerHeight;
            const yFailedTop = ySuccessTop - failedHeight;

            const isSpike = d.failed > 8; // Oct 26 spike

            return (
              <g key={i}>
                {/* Successful portion */}
                <rect
                  x={x}
                  y={ySuccessTop}
                  width={barWidth}
                  height={successHeight}
                  rx="3"
                  className="fill-emerald-500"
                />
                {/* Failed portion */}
                {d.failed > 0 && (
                  <rect
                    x={x}
                    y={yFailedTop}
                    width={barWidth}
                    height={failedHeight}
                    rx="2"
                    className={isSpike ? 'fill-rose-600 animate-pulse' : 'fill-rose-400'}
                  />
                )}
                {/* Spike Callout */}
                {isSpike && (
                  <g>
                    <text
                      x={x + 9}
                      y={yFailedTop - 6}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-rose-600"
                    >
                      {d.failed} Failures
                    </text>
                  </g>
                )}
                {/* X axis date */}
                <text
                  x={x + 9}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-400 font-medium"
                >
                  {d.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
