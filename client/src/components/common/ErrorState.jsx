import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  message = "Unable to load data. Please check your connection and try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-6 rounded-[24px] border border-rose-200 bg-rose-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h4 className="text-base font-bold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-rose-700 max-w-sm mb-4 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button variant="dangerOutline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

