import Button from "./Button";

export default function EmptyState({
  title = "No data available",
  description = "Get started by logging your first blood glucose measurement.",
  actionLabel,
  onAction,
  icon,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-[24px] border border-dashed border-[#CFDDEB] bg-[#F8FBFE] ${className}`}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EAF4FE] border border-[#BFD9EE] flex items-center justify-center text-[#0A387E] mb-4 shadow-xs">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>

      <h4 className="text-base sm:text-lg font-bold text-[#0B1B4F] mb-1">
        {title}
      </h4>

      <p className="text-xs sm:text-sm text-[#556987] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

