export default function Input({
  label,
  id,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon,
  iconRight,
  required = false,
  disabled = false,
  className = "",
  containerClassName = "",
  min,
  max,
  step,
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-[13px] font-semibold text-[#0B1B4F] mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-2xl border transition-all duration-150 bg-white px-3.5 sm:px-4 h-[46px] sm:h-[48px] ${
          error
            ? "border-rose-400 ring-2 ring-rose-100"
            : "border-[#D3DFEB] focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10"
        } ${disabled ? "opacity-60 bg-slate-50 cursor-not-allowed" : ""}`}
      >
        {icon && (
          <span className="text-[#556987] mr-2.5 shrink-0 select-none">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`w-full bg-transparent text-[14px] text-[#0F172A] placeholder-[#8598B0] outline-none font-normal disabled:cursor-not-allowed ${className}`}
          {...props}
        />

        {iconRight && (
          <span className="text-[#556987] ml-2 shrink-0 select-none">
            {iconRight}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#556987]">{helperText}</p>
      ) : null}
    </div>
  );
}

