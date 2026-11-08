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
    <div className="h-screen w-screen overflow-hidden relative bg-[#EAF4FE] flex items-center justify-center selection:bg-[#0A387E] selection:text-white">
      {/* Desktop Background Template: fits 100% within viewport without any cropping */}
      <img
        src="/images/login-bg-with-logo.png"
        alt="Sweety Health Background Template"
        className="hidden lg:block absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
      />

      {/* Mobile/Tablet Background */}
      <div
        className="block lg:hidden absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none select-none z-0 opacity-30"
        style={{ backgroundImage: "url('/images/login-bg-with-logo.png')" }}
      />

      {/* Viewport Content Wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-end px-4 sm:px-6 lg:pr-[3.5%] xl:pr-[4.5%] overflow-y-auto py-4 sm:py-6 lg:py-0">
        
        {/* Mobile-only Brand Header (Hidden on Desktop) */}
        <div className="w-full max-w-[440px] mb-4 flex flex-col items-center text-center lg:hidden">
          <img
            src="/images/sweety-logo-cropped.png"
            alt="Sweety Logo"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm mb-1.5"
          />
          <p className="text-xs font-medium text-slate-500 tracking-wide">
            Track • Monitor • Live Healthy
          </p>
        </div>

        {/* Register Form Card */}
        <div className="w-full max-w-[420px] sm:max-w-[440px] xl:max-w-[450px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(10,56,126,0.12)] border border-[#E2EBF4] px-6 sm:px-9 py-5 sm:py-6 my-auto transition-all flex flex-col justify-between">
          
          <div>
            {/* Heartbeat pulse icon with flanking dividers */}
            <div className="flex items-center justify-center gap-3.5 mb-2">
              <div className="h-[1.5px] w-12 sm:w-16 bg-[#B9D8EC]" />
              <div className="w-8 h-8 flex items-center justify-center text-[#09778F]">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Heart Base */}
                  <path
                    d="M14 24.5C14 24.5 2.5 17.8 2.5 9.8C2.5 5.6 5.8 2.3 9.9 2.3C12.1 2.3 13.2 3.4 14 4.3C14.8 3.4 15.9 2.3 18.1 2.3C22.2 2.3 25.5 5.6 25.5 9.8C25.5 17.8 14 24.5 14 24.5Z"
                    fill="#0B798F"
                  />
                  {/* Heartbeat Pulse Line */}
                  <path
                    d="M6 11.5H10.2L11.8 8L14 15L16.2 9.5L17.8 11.5H22"
                    stroke="#FFFFFF"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="h-[1.5px] w-12 sm:w-16 bg-[#B9D8EC]" />
            </div>

            {/* Heading */}
            <h1 className="text-[23px] sm:text-[25px] font-extrabold text-[#0B1B4F] text-center tracking-tight leading-tight">
              Create your account
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-[#556987] text-center mt-1 mb-3 font-normal">
              Start tracking your glucose levels with Sweety.
            </p>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-3 rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs sm:text-sm text-red-600 flex items-start gap-2"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              
              {/* Full Name Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[44px] sm:h-[46px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
                <span className="text-[#475A77] mr-3 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                  className="w-full bg-transparent text-[14px] text-[#0F172A] placeholder-[#5C6E88] outline-none font-normal"
                />
              </div>

              {/* Email Address Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[44px] sm:h-[46px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
                <span className="text-[#475A77] mr-3 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
                  className="w-full bg-transparent text-[14px] text-[#0F172A] placeholder-[#5C6E88] outline-none font-normal"
                />
              </div>

              {/* Password Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[44px] sm:h-[46px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
                <span className="text-[#475A77] mr-3 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  style={{ backgroundColor: "transparent" }}
                  className="w-full bg-transparent text-[14px] text-[#0F172A] placeholder-[#5C6E88] outline-none font-normal pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[#556987] hover:text-[#0B1B4F] transition-colors p-1 shrink-0 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-[#556987] hover:text-[#0B1B4F] transition-colors"
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
                      className="w-5 h-5 text-[#556987] hover:text-[#0B1B4F] transition-colors"
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

              {/* Confirm Password Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[44px] sm:h-[46px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
                <span className="text-[#475A77] mr-3 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                  className="w-full bg-transparent text-[14px] text-[#0F172A] placeholder-[#5C6E88] outline-none font-normal pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-[#556987] hover:text-[#0B1B4F] transition-colors p-1 shrink-0 focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5 text-[#556987] hover:text-[#0B1B4F] transition-colors"
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
                      className="w-5 h-5 text-[#556987] hover:text-[#0B1B4F] transition-colors"
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

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[46px] sm:h-[48px] rounded-full bg-[#0A387E] hover:bg-[#072B63] active:scale-[0.99] text-white font-semibold text-[15.5px] sm:text-[16px] tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#0A387E]/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer !mt-3"
              >
                <span>{loading ? "Creating account..." : "Create account"}</span>
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

          {/* Health Journey Feature Card (Compact Size) */}
          <div className="mt-3 mb-1 rounded-[16px] bg-[#EAF7FF] border border-[#D5E8F8] px-3 py-2 sm:py-2.5">
            {/* Header with Shield Icon */}
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="h-[1px] bg-[#BFD9EE] flex-1" />
              <div className="flex items-center gap-1.5 shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
                    fill="#0B58C7"
                  />
                  <path
                    d="M12 7.5c-1.2 0-2 .8-2 2 0 1.5 2 3.5 2 3.5s2-2 2-3.5c0-1.2-.8-2-2-2z"
                    fill="#FFFFFF"
                  />
                </svg>
                <span className="font-bold text-[11px] sm:text-[11.5px] text-[#0B1B4F]">
                  Your Health Journey Starts Here
                </span>
              </div>
              <div className="h-[1px] bg-[#BFD9EE] flex-1" />
            </div>

            {/* 3 Equal Columns */}
            <div className="grid grid-cols-3 divide-x divide-[#BFD9EE] my-0.5 text-center">
              
              {/* Daily Tracking */}
              <div className="px-0.5 flex flex-col items-center">
                <svg className="w-4 h-4 text-[#1565C0] mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                </svg>
                <span className="font-bold text-[10px] sm:text-[10.5px] text-[#0B1B4F] leading-tight">
                  Daily<br />Tracking
                </span>
              </div>

              {/* Health Reports */}
              <div className="px-0.5 flex flex-col items-center">
                <svg className="w-4 h-4 text-[#1565C0] mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="14" width="3.5" height="7" rx="1" />
                  <rect x="10.25" y="9" width="3.5" height="12" rx="1" />
                  <rect x="16.5" y="4" width="3.5" height="17" rx="1" />
                </svg>
                <span className="font-bold text-[10px] sm:text-[10.5px] text-[#0B1B4F] leading-tight">
                  Health<br />Reports
                </span>
              </div>

              {/* Monthly History */}
              <div className="px-0.5 flex flex-col items-center">
                <svg className="w-4 h-4 text-[#1565C0] mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-bold text-[10px] sm:text-[10.5px] text-[#0B1B4F] leading-tight">
                  Monthly<br />History
                </span>
              </div>

            </div>

            {/* Bottom Quote with lines */}
            <div className="flex items-center justify-center mt-1.5 pt-0.5">
              <div className="h-[1px] bg-[#BFD9EE] flex-1 max-w-[20px] sm:max-w-[28px]" />
              <span className="italic text-[9.5px] sm:text-[10px] text-[#1E3A5F] font-medium mx-2 whitespace-nowrap">
                Every reading matters. Every day counts. <span className="not-italic">❤️</span>
              </span>
              <div className="h-[1px] bg-[#BFD9EE] flex-1 max-w-[20px] sm:max-w-[28px]" />
            </div>
          </div>

          {/* Sign In Footer */}
          <div className="mt-2 text-center">
            <p className="text-[13px] sm:text-[13.5px] text-[#475569]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#0B58C7] hover:text-[#073F91] font-semibold hover:underline ml-1"
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
