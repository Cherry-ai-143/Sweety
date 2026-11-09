import { useState, useMemo } from "react";
import {
  toDateInputValue,
  formatDate,
  getGlucoseStatus,
  SLOT_SHORT_LABELS,
} from "../../utils/glucoseUtils";

export default function MonthlyGlucoseChart({ readings = [], average = null }) {
  const [activePoint, setActivePoint] = useState(null);

  // Sort readings chronologically
  const sortedReadings = useMemo(() => {
    return [...readings].sort(
      (a, b) => new Date(a.reading_date) - new Date(b.reading_date)
    );
  }, [readings]);

  if (!sortedReadings || sortedReadings.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#F8FBFE] rounded-2xl border border-dashed border-[#CFDDEB]">
        <div className="w-10 h-10 rounded-xl bg-[#EAF4FE] text-[#0A387E] flex items-center justify-center mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#0B1B4F]">No readings logged for this month</p>
        <p className="text-xs text-[#556987] mt-0.5">
          As you log readings throughout the month, your trend line will be displayed here.
        </p>
      </div>
    );
  }

  // Chart coordinate math
  const width = 640;
  const height = 290;
  const paddingX = 55;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  const minY = 40;
  const maxY = 300;
  const yAxisLevels = [40, 80, 100, 120, 140, 160, 180, 200, 220, 240, 300];

  function getY(val) {
    const clamped = Math.max(minY, Math.min(maxY, val));
    const ratio = (clamped - minY) / (maxY - minY);
    return height - paddingBottom - ratio * chartHeight;
  }

  // Calculate X coordinate for each reading
  const count = sortedReadings.length;
  const points = sortedReadings.map((r, index) => {
    const val = Number(r.glucose_value);
    const x =
      count === 1
        ? width / 2
        : paddingX + (index / (count - 1)) * chartWidth;
    const y = getY(val);
    const status = getGlucoseStatus(val, r.time_slot);
    return {
      id: r.id,
      reading: r,
      date: toDateInputValue(r.reading_date),
      slot: r.time_slot,
      slotLabel: SLOT_SHORT_LABELS[r.time_slot] || r.time_slot,
      value: val,
      status,
      x,
      y,
      index,
    };
  });

  // SVG Path
  let pathD = "";
  points.forEach((p, idx) => {
    if (idx === 0) {
      pathD += `M ${p.x} ${p.y}`;
    } else {
      pathD += ` L ${p.x} ${p.y}`;
    }
  });

  // Area path for gradient fill
  const areaD =
    count > 1
      ? `${pathD} L ${points[count - 1].x} ${height - paddingBottom} L ${
          points[0].x
        } ${height - paddingBottom} Z`
      : "";

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Legend & Metric overview */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#556987] mb-3 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0A387E] rounded-full" />
            <span className="font-medium text-[#0B1B4F]">Glucose Trend</span>
          </span>
          {average && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
              <span className="font-medium text-emerald-800">
                Monthly Avg: {average} mg/dL
              </span>
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#8598B0]">
          {count} total measurement{count > 1 ? "s" : ""}
        </span>
      </div>

      <div className="w-full aspect-[2.2/1] min-h-[240px] max-h-[310px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="monthlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="35%" stopColor="#10B981" stopOpacity="0.14" />
              <stop offset="70%" stopColor="#34D399" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Left Y-axis vertical line */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={paddingX}
            y2={height - paddingBottom}
            stroke="#E2EBF4"
            strokeWidth="1"
          />

          {/* Bottom X-axis baseline */}
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#E2EBF4"
            strokeWidth="1"
          />

          {/* Y-axis labels & tick marks (no dashed lines) */}
          {yAxisLevels.map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                {/* Small Y-axis tick mark */}
                <line
                  x1={paddingX - 4}
                  y1={y}
                  x2={paddingX}
                  y2={y}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] fill-[#8598B0] font-medium"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Gradient Area Fill */}
          {areaD && <path d={areaD} fill="url(#monthlyAreaGrad)" />}

          {/* Trend Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#0A387E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p) => {
            const isHovered = activePoint?.id === p.id;
            const dotFill =
              p.status.category === "normal"
                ? "#10B981"
                : p.status.category === "elevated"
                ? "#F59E0B"
                : p.status.category === "low"
                ? "#0284C7"
                : "#EF4444";

            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(p)}
                onMouseLeave={() => setActivePoint(null)}
                onClick={() => setActivePoint(p)}
              >
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="10"
                    fill={dotFill}
                    fillOpacity="0.25"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "6" : "4"}
                  fill="#FFFFFF"
                  stroke={dotFill}
                  strokeWidth="2.5"
                />
              </g>
            );
          })}

          {/* Sample Date labels along bottom */}
          {points
            .filter(
              (_, i) =>
                i === 0 ||
                i === Math.floor(points.length / 2) ||
                i === points.length - 1
            )
            .map((p) => (
              <text
                key={`lbl-${p.id}`}
                x={p.x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] fill-[#556987] font-semibold"
              >
                {formatDate(p.date)}
              </text>
            ))}
        </svg>
      </div>

      {/* Selected Data Point Detail Card */}
      {activePoint && (
        <div className="mt-2 flex items-center justify-between p-3 rounded-xl bg-white border border-[#D5E8F8] shadow-sm animate-in fade-in duration-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EAF4FE] text-[#0A387E] flex items-center justify-center font-bold text-xs">
              {activePoint.slotLabel.slice(0, 3)}
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B1B4F]">
                {formatDate(activePoint.date)} • {activePoint.slotLabel}
              </p>
              <p className="text-[11px] text-[#556987]">
                Glucose Level:{" "}
                <span className="font-extrabold text-[#0A387E]">
                  {activePoint.value} mg/dL
                </span>
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${activePoint.status.badgeClass}`}>
            {activePoint.status.label}
          </span>
        </div>
      )}
    </div>
  );
}

