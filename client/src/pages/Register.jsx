import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register(name.trim(), email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#EAF4FF] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#103F82] selection:text-white">
      {/* Main Centered White Container (occupying ~72-78% on desktop) */}
      <div className="w-full max-w-[1020px] xl:max-w-[1080px] bg-white rounded-[36px] sm:rounded-[44px] lg:rounded-[48px] shadow-[0_20px_60px_rgba(16,63,130,0.07)] border border-[#E2EEF8]/60 p-6 sm:p-9 lg:p-11 xl:p-12 relative flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-10">
        
        {/* Left Panel – Sweety branding and glucose illustration (~54%) */}
        <div className="w-full lg:w-[54%] flex flex-col justify-between py-1 lg:py-2">
          <div>
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-extrabold text-[#092F65] leading-[1.18] tracking-tight">
              Take Control of<br />
              Your Health,<br />
              <span className="text-[#FF9800]">One Reading</span> at a Time.
            </h1>

            {/* Supporting Description */}
            <p className="text-[#687F9F] text-sm sm:text-[15px] mt-3 font-normal max-w-[430px] leading-relaxed">
              Track your blood glucose, monitor your progress and live healthier with Sweety.
            </p>
          </div>

          {/* Glucose Reading Illustration & Tagline */}
          <div className="mt-6 sm:mt-8 flex flex-col items-center lg:items-start">
            <div className="w-full max-w-[440px] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_8px_25px_rgba(16,63,130,0.07)] border border-[#E2EEF8]/80 bg-[#F4F9FD]">
              <img
                src="/images/glucose-reading.png"
                alt="Blood glucose monitoring reading 98 mg/dL"
                className="w-full h-[180px] sm:h-[210px] lg:h-[220px] object-cover"
              />
            </div>

            {/* Tagline Pill below image */}
            <div className="w-full max-w-[440px] flex justify-center mt-3.5">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-[0_4px_16px_rgba(16,63,130,0.08)] border border-[#E2EEF8] text-xs sm:text-[12.5px] font-semibold text-[#092F65]">
                <div className="w-4 h-4 rounded-full bg-[#07869A] flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-2.5 h-2.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12h3.5l2-4 3.5 8 2.5-5 1.5 2H21"
                    />
                  </svg>
                </div>
                <span>Healthy Today. Happier Tomorrow.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel – Sweety Register Card (~46%) */}
        <div className="w-full lg:w-[46%] max-w-[420px] bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EEF8] shadow-[0_12px_40px_rgba(16,63,130,0.06)] px-6 sm:px-7 py-5 sm:py-6 flex flex-col justify-between">
          <div>
            {/* Sweety Official Logo Asset */}
            <div className="flex justify-center mb-1">
              <img
                src="/images/sweety-logo-cropped.png"
                alt="Sweety Logo"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>

            {/* Welcome Heading */}
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#092F65] text-center tracking-tight leading-tight">
              Create your account
            </h2>
            <p className="text-[12px] sm:text-[12.5px] text-[#687F9F] text-center mt-0.5 mb-3 font-normal">
              Start tracking your glucose levels with Sweety.
            </p>

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                className="mb-2.5 rounded-2xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-600 flex items-start gap-2"
              >
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
              {/* Full Name Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D1E0F2] bg-white px-3.5 h-[42px] sm:h-[44px] transition focus-within:border-[#103F82] focus-within:ring-3 focus-within:ring-[#103F82]/10">
                <span className="text-[#687F9F] mr-2.5 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  style={{ backgroundColor: "transparent" }}
                  className="w-full bg-transparent text-[13px] sm:text-[13.5px] text-[#0F172A] placeholder-[#8A9EB5] outline-none font-normal"
                />
              </div>

              {/* Email Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D1E0F2] bg-white px-3.5 h-[42px] sm:h-[44px] transition focus-within:border-[#103F82] focus-within:ring-3 focus-within:ring-[#103F82]/10">
                <span className="text-[#687F9F] mr-2.5 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7l9 6 9-6"
                    />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  style={{ backgroundColor: "transparent" }}
                  className="w-full bg-transparent text-[13px] sm:text-[13.5px] text-[#0F172A] placeholder-[#8A9EB5] outline-none font-normal"
                />
              </div>

              {/* Password Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D1E0F2] bg-white px-3.5 h-[42px] sm:h-[44px] transition focus-within:border-[#103F82] focus-within:ring-3 focus-within:ring-[#103F82]/10">
                <span className="text-[#687F9F] mr-2.5 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 11V7a4 4 0 018 0v4"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (min 8 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  style={{ backgroundColor: "transparent" }}
                  className="w-full bg-transparent text-[13px] sm:text-[13.5px] text-[#0F172A] placeholder-[#8A9EB5] outline-none font-normal pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[#687F9F] hover:text-[#092F65] transition-colors p-1 shrink-0 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D1E0F2] bg-white px-3.5 h-[42px] sm:h-[44px] transition focus-within:border-[#103F82] focus-within:ring-3 focus-within:ring-[#103F82]/10">
                <span className="text-[#687F9F] mr-2.5 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 11V7a4 4 0 018 0v4"
                    />
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  style={{ backgroundColor: "transparent" }}
                  className="w-full bg-transparent text-[13px] sm:text-[13.5px] text-[#0F172A] placeholder-[#8A9EB5] outline-none font-normal pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-[#687F9F] hover:text-[#092F65] transition-colors p-1 shrink-0 focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[42px] sm:h-[44px] rounded-full bg-[#103F82] hover:bg-[#082F67] active:scale-[0.99] text-white font-semibold text-[14px] sm:text-[14.5px] tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-[#103F82]/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer !mt-2.5"
              >
                <span>{loading ? "Creating account..." : "Create Account"}</span>
                {!loading && (
                  <svg
                    className="w-4 h-4 stroke-[2.5]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </button>
            </form>
          </div>

          {/* Health Journey Starts Here Compact Section */}
          <div className="mt-2.5 rounded-[16px] bg-[#EAF6FF] border border-[#D5E8F8] px-3 py-2">
            {/* Header with Shield Icon */}
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <svg
                className="w-3.5 h-3.5 text-[#103F82]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              </svg>
              <span className="font-bold text-[10.5px] sm:text-[11px] text-[#092F65]">
                Your Health Journey Starts Here
              </span>
            </div>

            {/* 3 Equal Columns */}
            <div className="grid grid-cols-3 divide-x divide-[#D5E8F8] text-center">
              {/* Daily Tracking */}
              <div className="px-1 flex flex-col items-center">
                <svg
                  className="w-3.5 h-3.5 text-[#103F82] mb-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                </svg>
                <span className="font-bold text-[9.5px] text-[#092F65] leading-tight">
                  Daily<br />Tracking
                </span>
              </div>

              {/* Health Reports */}
              <div className="px-1 flex flex-col items-center">
                <svg
                  className="w-3.5 h-3.5 text-[#103F82] mb-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="4" y="14" width="3.5" height="7" rx="1" />
                  <rect x="10.25" y="9" width="3.5" height="12" rx="1" />
                  <rect x="16.5" y="4" width="3.5" height="17" rx="1" />
                </svg>
                <span className="font-bold text-[9.5px] text-[#092F65] leading-tight">
                  Health<br />Reports
                </span>
              </div>

              {/* Monthly History */}
              <div className="px-1 flex flex-col items-center">
                <svg
                  className="w-3.5 h-3.5 text-[#103F82] mb-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-bold text-[9.5px] text-[#092F65] leading-tight">
                  Monthly<br />History
                </span>
              </div>
            </div>

            {/* Bottom Quote with lines */}
            <div className="flex items-center justify-center mt-1.5 pt-1 border-t border-[#D5E8F8]/60">
              <div className="h-[1px] bg-[#BFD9EE] flex-1 max-w-[20px] sm:max-w-[28px]" />
              <span className="italic text-[9px] sm:text-[9.5px] text-[#1E3A5F] font-medium mx-2 whitespace-nowrap">
                Every reading matters. Every day counts. <span className="not-italic">❤️</span>
              </span>
              <div className="h-[1px] bg-[#BFD9EE] flex-1 max-w-[20px] sm:max-w-[28px]" />
            </div>
          </div>

          {/* Already have an account? Sign in */}
          <div className="mt-2 text-center">
            <p className="text-[12px] sm:text-[12.5px] text-[#556987]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#103F82] hover:text-[#082F67] font-semibold hover:underline ml-0.5"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;