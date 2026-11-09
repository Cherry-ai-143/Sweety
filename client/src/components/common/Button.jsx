export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  icon,
  iconRight,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]";

  const sizeClasses = {
    sm: "h-[38px] px-3.5 text-xs rounded-xl gap-1.5",
    md: "h-[46px] px-5 text-sm rounded-full sm:rounded-2xl gap-2",
    lg: "h-[50px] px-6 text-base rounded-full sm:rounded-2xl gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-[#0A387E] hover:bg-[#072B63] text-white shadow-md shadow-[#0A387E]/20 hover:shadow-lg hover:shadow-[#0A387E]/30",
    secondary:
      "bg-[#EAF4FE] hover:bg-[#D7EAFB] text-[#0A387E] border border-[#BFD9EE]",
    outline:
      "bg-white hover:bg-[#F4F8FC] text-[#0B1B4F] border border-[#D3DFEB] shadow-xs hover:border-[#B9D8EC]",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20",
    dangerOutline:
      "bg-white hover:bg-rose-50 text-rose-600 border border-rose-200",
    ghost:
      "bg-transparent hover:bg-slate-100 text-[#556987] hover:text-[#0B1B4F]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
}

