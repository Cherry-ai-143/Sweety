import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("sweety_remember_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

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

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      if (rememberMe) {
        localStorage.setItem("sweety_remember_email", formData.email.trim());
      } else {
        localStorage.removeItem("sweety_remember_email");
      }

      await login(formData.email.trim(), formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#EAF4FF] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#103F82] selection:text-white">
      {/* Main Centered White Container (occupying ~72-78% on desktop) */}
      <div className="w-full max-w-[1020px] xl:max-w-[1080px] bg-white rounded-[36px] sm:rounded-[44px] lg:rounded-[48px] shadow-[0_20px_60px_rgba(16,63,130,0.07)] border border-[#E2EEF8]/60 p-6 sm:p-9 lg:p-11 xl:p-12 relative flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-10">
        
        {/* Left Panel – Sweety branding and glucose illustration (~55%) */}
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

        {/* Right Panel – Sweety login card (~45%) */}
        <div className="w-full lg:w-[46%] max-w-[420px] bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EEF8] shadow-[0_12px_40px_rgba(16,63,130,0.06)] px-6 sm:px-7 py-6 sm:py-7 flex flex-col justify-between">
          <div>
            {/* Sweety Official Logo Asset */}
            <div className="flex justify-center mb-1">
              <img
                src="/images/sweety-logo-cropped.png"
                alt="Sweety Logo"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </div>

            {/* Welcome Heading */}
            <h2 className="text-[21px] sm:text-[23px] font-extrabold text-[#092F65] text-center tracking-tight leading-tight">
              Welcome Back!
            </h2>
            <p className="text-[12px] sm:text-[12.5px] text-[#687F9F] text-center mt-0.5 mb-3.5 font-normal">
              Login to your Sweety account
            </p>

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                className="mb-3 rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600 flex items-start gap-2"
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D1E0F2] bg-white px-3.5 h-[44px] sm:h-[46px] transition focus-within:border-[#103F82] focus-within:ring-3 focus-within:ring-[#103F82]/10">
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
                  className="w-full bg-transparent text-[13.5px] text-[#0F172A] placeholder-[#8A9EB5] outline-none font-normal"
                />
              </div>

              {/* Password Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D1E0F2] bg-white px-3.5 h-[44px] sm:h-[46px] transition focus-within:border-[#103F82] focus-within:ring-3 focus-within:ring-[#103F82]/10">
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
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  style={{ backgroundColor: "transparent" }}
                  className="w-full bg-transparent text-[13.5px] text-[#0F172A] placeholder-[#8A9EB5] outline-none font-normal pr-2"
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
                      strokeWidth="1.8"
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
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[12px] sm:text-[12.5px] pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-[4px] border-[#CBD5E1] text-[#103F82] focus:ring-[#103F82] cursor-pointer"
                  />
                  <span className="text-[#556987] font-normal hover:text-[#092F65] transition-colors">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[#103F82] hover:text-[#082F67] font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[44px] sm:h-[46px] rounded-full bg-[#103F82] hover:bg-[#082F67] active:scale-[0.99] text-white font-semibold text-[14.5px] sm:text-[15px] tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-[#103F82]/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-1"
              >
                <span>{loading ? "Signing in..." : "Login"}</span>
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
          <div className="mt-3.5 rounded-[18px] bg-[#EAF6FF] border border-[#D5E8F8] px-3 py-2.5">
            {/* Header with Shield Icon */}
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <svg
                className="w-3.5 h-3.5 text-[#103F82]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              </svg>
              <span className="font-bold text-[11px] sm:text-[11.5px] text-[#092F65]">
                Your Health Journey Starts Here
              </span>
            </div>

            {/* 3 Equal Columns */}
            <div className="grid grid-cols-3 divide-x divide-[#D5E8F8] text-center">
              {/* Daily Tracking */}
              <div className="px-1 flex flex-col items-center">
                <svg
                  className="w-4 h-4 text-[#103F82] mb-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                </svg>
                <span className="font-bold text-[10px] text-[#092F65] leading-tight">
                  Daily<br />Tracking
                </span>
              </div>

              {/* Health Reports */}
              <div className="px-1 flex flex-col items-center">
                <svg
                  className="w-4 h-4 text-[#103F82] mb-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="4" y="14" width="3.5" height="7" rx="1" />
                  <rect x="10.25" y="9" width="3.5" height="12" rx="1" />
                  <rect x="16.5" y="4" width="3.5" height="17" rx="1" />
                </svg>
                <span className="font-bold text-[10px] text-[#092F65] leading-tight">
                  Health<br />Reports
                </span>
              </div>

              {/* Monthly History */}
              <div className="px-1 flex flex-col items-center">
                <svg
                  className="w-4 h-4 text-[#103F82] mb-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-bold text-[10px] text-[#092F65] leading-tight">
                  Monthly<br />History
                </span>
              </div>
            </div>

            {/* Bottom Quote with lines */}
            <div className="flex items-center justify-center mt-2 pt-1 border-t border-[#D5E8F8]/60">
              <div className="h-[1px] bg-[#BFD9EE] flex-1 max-w-[20px] sm:max-w-[28px]" />
              <span className="italic text-[9.5px] sm:text-[10px] text-[#1E3A5F] font-medium mx-2 whitespace-nowrap">
                Every reading matters. Every day counts. <span className="not-italic">❤️</span>
              </span>
              <div className="h-[1px] bg-[#BFD9EE] flex-1 max-w-[20px] sm:max-w-[28px]" />
            </div>
          </div>

          {/* Don't have an account? Sign up */}
          <div className="mt-3 text-center">
            <p className="text-[12px] sm:text-[12.5px] text-[#556987]">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-[#103F82] hover:text-[#082F67] font-semibold hover:underline ml-0.5"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;