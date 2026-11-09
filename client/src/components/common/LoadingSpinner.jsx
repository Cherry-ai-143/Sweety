export default function LoadingSpinner({
  message = "Loading...",
  size = "md",
  className = "",
}) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer pulse */}
        <div className={`${sizeMap[size] || sizeMap.md} rounded-full bg-[#0A387E]/10 animate-ping absolute`} />
        
        {/* Animated spinner with heart icon */}
        <svg
          className={`${sizeMap[size] || sizeMap.md} animate-spin text-[#0A387E]`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      {message && (
        <p className="mt-4 text-sm font-medium text-[#556987] animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

