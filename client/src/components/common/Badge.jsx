export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
}) {
  const variantClasses = {
    normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    elevated: "bg-amber-50 text-amber-700 border-amber-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    low: "bg-sky-50 text-sky-700 border-sky-200",
    info: "bg-[#EAF4FE] text-[#0A387E] border-[#BFD9EE]",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const dotClasses = {
    normal: "bg-emerald-500",
    success: "bg-emerald-500",
    elevated: "bg-amber-500",
    warning: "bg-amber-500",
    high: "bg-rose-500",
    danger: "bg-rose-500",
    low: "bg-sky-500",
    info: "bg-[#0A387E]",
    neutral: "bg-slate-400",
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant] || dotClasses.neutral}`}
        />
      )}
      {children}
    </span>
  );
}

