import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import UserDropdown from "./UserDropdown";

export default function TopNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Blood Glucose Readings",
      shortLabel: "Readings",
      to: "/readings",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      label: "Daily Reports",
      to: "/daily-reports",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Monthly Reports",
      to: "/monthly-reports",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2EBF4] shadow-[0_2px_15px_rgba(10,56,126,0.04)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px] gap-2 md:gap-4">
          
          {/* LEFT SECTION – Branding */}
          <div className="flex items-center shrink-0">
            <NavLink
              to="/dashboard"
              className="flex items-center group py-1"
              aria-label="Sweety Home"
            >
              <img
                src="/images/sweety-logo-cropped.png"
                alt="Sweety"
                className="h-9 sm:h-10 md:h-[42px] w-auto max-w-[160px] sm:max-w-[180px] object-contain transition-transform group-hover:scale-[1.02]"
              />
            </NavLink>
          </div>

          {/* CENTER SECTION – Main Navigation (Desktop & Laptop & Tablet-Large) */}
          <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 max-w-2xl px-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 xl:px-3.5 py-2 rounded-2xl text-[13px] xl:text-[13.5px] font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? "bg-[#EAF4FE] text-[#0A387E] shadow-xs border border-[#D5E8F8]"
                      : "text-[#556987] hover:bg-[#F4F8FC] hover:text-[#0B1B4F] border border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`transition-colors ${
                        isActive
                          ? "text-[#0A387E]"
                          : "text-[#8598B0] group-hover:text-[#0A387E]"
                      }`}
                    >
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* RIGHT SECTION – User Account & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Account Popover Dropdown */}
            <UserDropdown />

            {/* Mobile / Tablet Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 rounded-2xl border border-[#D3DFEB] text-[#0B1B4F] hover:bg-[#F4F8FC] transition-colors shrink-0 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE / TABLET SLIDE-DOWN NAVIGATION PANEL */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2EBF4] shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#EAF4FE] text-[#0A387E] border border-[#D5E8F8]"
                      : "text-[#556987] hover:bg-[#F4F8FC] hover:text-[#0B1B4F]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={isActive ? "text-[#0A387E]" : "text-[#8598B0]"}
                    >
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

