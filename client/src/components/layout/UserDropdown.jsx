import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Close on Escape key press
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleLogout() {
    setIsOpen(false);
    logout();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Header Trigger Section with Avatar before user name */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 sm:gap-2.5 text-left px-2 sm:px-2.5 py-1 rounded-xl hover:bg-[#F0F6FC] transition-colors cursor-pointer select-none group"
        title="Account menu"
      >
        {/* User Profile Avatar Icon in light blue circle */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5F0FC] flex items-center justify-center text-[#0A438C] shrink-0 border border-[#D0E3F7]">
          <svg
            className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="7.5" r="3.75" />
            <path d="M5.5 19.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-xs sm:text-[13.5px] font-bold text-[#0B1B4F] leading-tight truncate max-w-[140px] sm:max-w-[180px] group-hover:text-[#0A387E] transition-colors">
            {user?.name || "User"}
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#09778F] font-semibold leading-none mt-0.5">
            Monitoring active
          </p>
        </div>
      </button>

      {/* Compact Minimal Dropdown Card directly underneath */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-1.5 w-52 sm:w-56 bg-white rounded-2xl border border-[#E2EBF4] shadow-[0_12px_32px_rgba(10,56,126,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Simple User Information: Avatar, Name & Email */}
          <div className="px-2.5 py-2 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E5F0FC] flex items-center justify-center text-[#0A438C] shrink-0 border border-[#D0E3F7]">
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="7.5" r="3.75" />
                <path d="M5.5 19.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-[#0B1B4F] truncate leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-[#556987] truncate mt-0.5">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* Subtle Divider */}
          <div className="my-1 border-t border-[#EEF4FA]" />

          {/* Red Logout Action */}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
          >
            <svg
              className="w-4 h-4 shrink-0 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
