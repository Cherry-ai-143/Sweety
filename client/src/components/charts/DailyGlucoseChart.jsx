import { useState } from "react";
import {
  SLOT_ORDER,
  SLOT_SHORT_LABELS,
  SLOT_LABELS,
  getGlucoseStatus,
} from "../../utils/glucoseUtils";

export default function DailyGlucoseChart({ readings = [] }) {
  const [activePoint, setActivePoint] = useState(null);

  // Map readings by slot
  const readingsBySlot = {};
  readings.forEach((r) => {
    readingsBySlot[r.time_slot] = r;
  });

  // Target ranges & Y-axis scale (mg/dL)
  const minY = 40;
  const maxY = 300;
  const yAxisLevels = [40, 80, 100, 120, 140, 160, 180, 200, 220, 240, 300];
  const height = 290;
  const width = 500;
  const paddingX = 55;
  const paddingBottom = 35;
  const paddingTop = 25;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  function getY(val) {
    const clamped = Math.max(minY, Math.min(maxY, val));
    const ratio = (clamped - minY) / (maxY - minY);
    return height - paddingBottom - ratio * chartHeight;
  }

  function getX(index) {
    return paddingX + (index / (SLOT_ORDER.length - 1)) * chartWidth;
  }

  // Gather plot points
  const points = SLOT_ORDER.map((slot, index) => {
    const reading = readingsBySlot[slot];
    const x = getX(index);
    const value = reading ? Number(reading.glucose_value) : null;
    const y = value ? getY(value) : null;
    const status = value ? getGlucoseStatus(value, slot) : null;
    return {
      slot,
      slotLabel: SLOT_SHORT_LABELS[slot] || slot,
      fullSlotLabel: SLOT_LABELS[slot] || slot,
      reading,
      value,
      status,
      x,
      y,
      index,
    };
  });

  const loggedPoints = points.filter((p) => p.value !== null);

  if (loggedPoints.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-[#F8FBFE] rounded-2xl border border-dashed border-[#CFDDEB]">
        <div className="w-10 h-10 rounded-xl bg-[#EAF4FE] text-[#0A387E] flex items-center justify-center mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#0B1B4F]">No readings logged for this day</p>
        <p className="text-xs text-[#556987] mt-0.5">
          Readings logged in morning, breakfast, lunch, or dinner will chart here.
        </p>
      </div>
    );
  }

  // Chart baseline for area fill
  const baselineY = height - paddingBottom;

  // Create SVG path connecting available points
  let pathD = "";
  loggedPoints.forEach((p, idx) => {
    if (idx === 0) {
      pathD += `M ${p.x} ${p.y}`;
    } else {
      pathD += ` L ${p.x} ${p.y}`;
    }
  });

  // Area path: follows the curve, drops vertically to baseline at the last point,
  // runs horizontally back to the first point at baseline, and closes
  const areaD =
    loggedPoints.length > 1
      ? `${pathD} L ${loggedPoints[loggedPoints.length - 1].x} ${baselineY} L ${loggedPoints[0].x} ${baselineY} Z`
      : "";

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Legend & Target range overview */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#556987] mb-2 px-1">
        <div className="flex items-center gap-3.5">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0A387E] rounded-full" />
            <span className="font-medium text-[#0B1B4F]">Glucose Curve</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/25 border border-emerald-500" />
            <span className="font-medium">Target Range (70–140 mg/dL)</span>
          </span>
        </div>
        <span className="text-[11px] text-[#8598B0]">Tap point for details</span>
      </div>

      <div className="w-full aspect-[1.8/1] min-h-[250px] max-h-[310px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          {/* Defs for subtle translucent mint-green gradient */}
          <defs>
            <linearGradient id="dailyGlucoseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.30" />
              <stop offset="35%" stopColor="#10B981" stopOpacity="0.16" />
              <stop offset="70%" stopColor="#34D399" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-axis vertical line */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={paddingX}
            y2={baselineY}
            stroke="#E2EBF4"
            strokeWidth="1"
          />

          {/* Bottom baseline line */}
          <line
            x1={paddingX}
            y1={baselineY}
            x2={width - paddingX}
            y2={baselineY}
            stroke="#E2EBF4"
            strokeWidth="1"
          />

          {/* Y-axis tick marks and labels without dashed lines */}
          {yAxisLevels.map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                {/* Clean tick mark at axis */}
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

          {/* Slots X-axis vertical guide lines and labels */}
          {points.map((p) => (
            <g key={p.slot}>
              <line
                x1={p.x}
                y1={paddingTop}
                x2={p.x}
                y2={height - paddingBottom}
                stroke="#EEF4FA"
                strokeWidth="1"
              />
              <text
                x={p.x}
                y={height - paddingBottom + 16}
                textAnchor="middle"
                className={`text-[10.5px] font-semibold ${
                  p.value ? "fill-[#0B1B4F]" : "fill-[#A0B0C4]"
                }`}
              >
                {p.slotLabel}
              </text>
            </g>
          ))}

          {/* Subtle Translucent Mint-Green Shaded Area Underneath the Curve */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#dailyGlucoseGradient)"
              className="pointer-events-none transition-all duration-300"
            />
          )}

          {/* Connecting Glucose Line (on top of shaded area) */}
          {loggedPoints.length > 1 && (
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
            if (!p.value) {
              return (
                <circle
                  key={p.slot}
                  cx={p.x}
                  cy={getY(100)}
                  r="3"
                  fill="#E2EBF4"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
              );
            }

            const isHovered = activePoint?.slot === p.slot;
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
                key={p.slot}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setActivePoint(p)}
                onMouseLeave={() => setActivePoint(null)}
                onClick={() => setActivePoint(p)}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill={dotFill}
                    fillOpacity="0.25"
                  />
                )}
                {/* Outer shadow ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "7" : "5.5"}
                  fill="#FFFFFF"
                  stroke={dotFill}
                  strokeWidth="3"
                />
                {/* Value label above dot */}
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="text-[11px] font-extrabold fill-[#0B1B4F]"
                >
                  {p.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating or Selected Point Detail Pill */}
      {activePoint && (
        <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D5E8F8] shadow-sm animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A387E]" />
            <span className="text-xs font-bold text-[#0B1B4F]">
              {activePoint.fullSlotLabel}:
            </span>
            <span className="text-xs font-extrabold text-[#0A387E]">
              {activePoint.value} mg/dL
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${activePoint.status.badgeClass}`}>
            {activePoint.status.label}
          </span>
        </div>
      )}
    </div>
  );
}

