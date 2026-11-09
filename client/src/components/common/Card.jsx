export default function Card({
  children,
  className = "",
  hoverable = false,
  highlight = false,
  padding = "p-5 sm:p-7",
  ...props
}) {
  return (
    <div
      className={`rounded-[24px] sm:rounded-[28px] border transition-all duration-200 ${
        highlight
          ? "bg-[#EAF7FF] border-[#D5E8F8]"
          : "bg-white border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)]"
      } ${
        hoverable
          ? "hover:shadow-[0_16px_40px_rgba(10,56,126,0.09)] hover:-translate-y-0.5"
          : ""
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

