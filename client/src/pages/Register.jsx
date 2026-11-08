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

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#EAF4FE] flex items-center justify-center selection:bg-[#0A387E] selection:text-white">
      {/* Desktop Background Template */}
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
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-end px-4 sm:px-6 lg:pr-[3.5%] xl:pr-[4.5%] overflow-y-auto lg:overflow-hidden py-6 lg:py-0">
        
        {/* Mobile-only Brand Header (Hidden on Desktop) */}
        <div className="w-full max-w-[440px] mb-5 flex flex-col items-center text-center lg:hidden">
          <img
            src="/images/sweety-logo-cropped.png"
            alt="Sweety Logo"
            className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm mb-1.5"
          />
          <p className="text-xs font-medium text-slate-500 tracking-wide">
            Track • Monitor • Live Healthy
          </p>
        </div>

        {/* Register Form Card */}
        <div className="w-full max-w-[420px] sm:max-w-[440px] xl:max-w-[450px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(10,56,126,0.12)] border border-[#E2EBF4] px-6 sm:px-9 py-6 sm:py-7 my-auto transition-all flex flex-col justify-between">
          
          <div>
            {/* Heartbeat pulse icon with flanking dividers */}
            <div className="flex items-center justify-center gap-3.5 mb-2.5">
              <div className="h-[1.5px] w-12 sm:w-16 bg-[#B9D8EC]" />
              <div className="w-8 h-8 flex items-center justify-center text-[#09778F]">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 24.5C14 24.5 2.5 17.8 2.5 9.8C2.5 5.6 5.8 2.3 9.9 2.3C12.1 2.3 13.2 3.4 14 4.3C14.8 3.4 15.9 2.3 18.1 2.3C22.2 2.3 25.5 5.6 25.5 9.8C25.5 17.8 14 24.5 14 24.5Z"
                    fill="#0B798F"
                  />
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
            <h1 className="text-[25px] sm:text-[27px] font-extrabold text-[#0B1B4F] text-center tracking-tight leading-tight">
              Create an Account
            </h1>
            <p className="text-[13px] sm:text-[13.5px] text-[#556987] text-center mt-1 mb-4 font-normal">
              Join Sweety to take control of your diabetes
            </p>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-3.5 rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs sm:text-sm text-red-600 flex items-start gap-2"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Full Name Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[46px] sm:h-[48px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
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

              {/* Email Field */}
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[46px] sm:h-[48px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
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
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[46px] sm:h-[48px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
                <span className="text-[#475A77] mr-3 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (min. 8 characters)"
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
              <div className="relative flex items-center rounded-2xl border border-[#D3DFEB] bg-white px-4 h-[46px] sm:h-[48px] transition focus-within:border-[#0A3D8F] focus-within:ring-4 focus-within:ring-[#0A3D8F]/10">
                <span className="text-[#475A77] mr-3 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  style={{ backgroundColor: "transparent" }}
                  className="w-full bg-transparent text-[14px] text-[#0F172A] placeholder-[#5C6E88] outline-none font-normal"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[46px] sm:h-[48px] rounded-full bg-[#0A387E] hover:bg-[#072B63] active:scale-[0.99] text-white font-semibold text-[15.5px] sm:text-[16px] tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#0A387E]/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                <span>{loading ? "Creating account..." : "Sign Up"}</span>
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

          {/* Footer Back to Login */}
          <div className="mt-4 pt-3 border-t border-[#EEF2F6] text-center">
            <p className="text-[13px] sm:text-[13.5px] text-[#475569]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#0B58C7] hover:text-[#073F91] font-semibold hover:underline ml-1"
              >
                Log in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;

