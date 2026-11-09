export default function StatCard({
  title,
  value,
  unit = "mg/dL",
  icon,
  badgeText,
  colorScheme = "blue",
}) {
  const schemeStyles = {
    blue: {
      iconBg: "bg-[#EAF4FE] text-[#0A387E] border-[#BFD9EE]",
      valueColor: "text-[#0B1B4F]",
    },
    cyan: {
      iconBg: "bg-teal-50 text-[#09778F] border-teal-200",
      valueColor: "text-[#0B1B4F]",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      valueColor: "text-[#0B1B4F]",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-700 border-amber-200",
      valueColor: "text-[#0B1B4F]",
    },
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.blue;

  return (
    <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-6 transition-all hover:shadow-[0_14px_35px_rgba(10,56,126,0.08)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs sm:text-[13px] font-semibold text-[#556987] truncate">
          {title}
        </span>
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 ${currentScheme.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mt-2">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${currentScheme.valueColor}`}>
          {value === null || value === undefined ? "--" : value}
        </span>
        {value !== null && value !== undefined && unit && (
          <span className="text-xs sm:text-sm font-semibold text-[#8598B0]">
            {unit}
          </span>
        )}
      </div>

      {badgeText && (
        <div className="mt-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F6FC] text-[#556987] border border-[#E2EBF4]">
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
