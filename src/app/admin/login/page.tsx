"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Info,
  Headphones,
  X,
  PhoneCall,
} from "lucide-react";
import { loginAdminAction } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAdminAction(formData);
      if (res.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setErrorMsg(res.error || "लॉगिन अयशस्वी झाले. कृपया ईमेल आणि पासवर्ड तपासा.");
      }
    });
  };

  return (
    <div className="min-h-screen lg:h-screen w-full relative flex items-center justify-center lg:justify-end bg-[#e2ede6] font-sans lg:overflow-hidden select-none">
      {/* Full-Page Fixed Background Graphic: Separate optimized graphics for Mobile & Desktop */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Mobile View Background Image (Fixed, fits screen, locked against scrolling) */}
        <div className="relative w-full h-full lg:hidden">
          <Image
            src="/images/admin-login-mobile-bg.png"
            alt="कोमलवाडी ग्रामपंचायत प्रशासकीय लॉगिन पार्श्वभूमी"
            fill
            priority
            sizes="100vw"
            className="object-fill"
          />
        </div>

        {/* Desktop View Background Image (Fixed, fits screen) */}
        <div className="relative w-full h-full hidden lg:block">
          <Image
            src="/images/admin-login-bg-clean.png"
            alt="कोमलवाडी ग्रामपंचायत प्रशासकीय लॉगिन पार्श्वभूमी"
            fill
            priority
            sizes="100vw"
            className="object-fill"
          />
        </div>
      </div>

      {/* Main Layout Grid: On mobile, only the top-positioned login card is shown; on desktop, split screen */}
      <div className="relative z-10 w-full min-h-screen lg:h-full flex items-start lg:items-center justify-center lg:justify-between p-3 sm:p-6 lg:p-0 pt-6 sm:pt-10 lg:pt-0">
        {/* ================================================================= */}
        {/* LEFT COLUMN: Brand Header, Title, Tagline & Homepage Link (Desktop Only) */}
        {/* ================================================================= */}
        <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] h-full flex-col justify-between py-6 sm:py-8 lg:py-10 px-6 sm:px-12 md:px-16 lg:pl-20 lg:pr-6 xl:pl-28 2xl:pl-32 select-text">
          {/* Top Brand Header */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-full"
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white p-1 flex items-center justify-center shadow-lg border-2 border-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/grampanchayat-emblem.webp"
                  alt="महाराष्ट्र शासन ग्रामपंचायत बोधचिन्ह"
                  width={46}
                  height={46}
                  priority
                  className="object-contain rounded-full"
                />
              </div>
              <div className="border-l border-white/30 pl-3 sm:pl-3.5 py-0.5">
                <h1 className="font-extrabold text-sm sm:text-base lg:text-lg text-white tracking-wide leading-tight drop-shadow-sm">
                  डिजिटल ग्रामपंचायत व्यवस्थापन
                </h1>
                <p className="text-[11px] sm:text-xs text-emerald-200/95 font-medium mt-0.5 leading-tight">
                  महाराष्ट्र शासन • ग्राम विकास विभाग
                </p>
              </div>
            </Link>

            {/* Main Title with Emerald Underline Accent Bar */}
            <div className="mt-6 sm:mt-8 lg:mt-9">
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-black tracking-tight text-white leading-tight drop-shadow-md">
                कोमलवाडी ग्रामपंचायत
              </h2>
              {/* Green Accent underline directly under "कोमलवाडी" */}
              <div className="w-14 sm:w-16 h-1.5 bg-[#4ade80] rounded-full mt-2.5 shadow-sm" />

              {/* Tagline / Subtitle */}
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm lg:text-[15px] text-white/95 leading-relaxed font-normal max-w-md drop-shadow-xs">
                गाव विकास, सेवा, योजना आणि प्रशासकीय कामकाजाचे
                <br className="hidden sm:inline" /> डिजिटल व्यवस्थापन – एकाच ठिकाणी.
              </p>
            </div>

            {/* Arrow Button to Redirect to Homepage */}
            <div className="mt-6 sm:mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 sm:py-3 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-semibold border border-white/25 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#4ade80] group-hover:-translate-x-1 transition-transform duration-200" />
                <span>मुख्य संकेतस्थळावर जा</span>
              </Link>
            </div>
          </div>

          {/* Bottom Area: Leaves space on desktop for the office photo in the background image */}
          <div className="hidden lg:block h-28 xl:h-36 pointer-events-none" aria-hidden="true" />
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Elevated White Login Card (Centered)        */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[46%] xl:w-[44%] flex flex-col items-center justify-start lg:justify-center py-2 sm:py-4 lg:py-0 lg:pr-10 xl:pr-16 select-text">
          {/* Clean Elevated White Login Card */}
          <div className="w-[88%] xs:w-[84%] sm:w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] bg-white rounded-[24px] sm:rounded-[32px] p-4.5 sm:p-7 shadow-2xl border border-slate-100 flex flex-col space-y-3 sm:space-y-3.5">
            {/* Top Emblem & Badge */}
            <div className="text-center space-y-1.5">
              <Link href="/" title="मुख्य संकेतस्थळावर जा" className="inline-block group focus:outline-none">
                <div className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-white p-1 flex items-center justify-center shadow-md border-2 border-emerald-700 group-hover:scale-105 transition-transform">
                  <Image
                    src="/images/grampanchayat-emblem.webp"
                    alt="महाराष्ट्र शासन ग्रामपंचायत अधिकृत बोधचिन्ह"
                    width={64}
                    height={64}
                    priority
                    className="object-contain rounded-full"
                  />
                </div>
              </Link>

              {/* Official Pill Badge */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-900 text-[11px] sm:text-xs font-bold border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>अधिकृत प्रशासकीय लॉगिन</span>
                </div>
              </div>

              {/* Titles */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  कोमलवाडी ग्रामपंचायत
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  ॲडमिन कन्सोल / Admin Console
                </p>
              </div>
            </div>

            {/* Advisory / Warning Notice Box */}
            <div className="p-2.5 sm:p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium text-[11px]">
                ही प्रणाली ग्रामपंचायत प्रशासक व अधिकृत कर्मचाऱ्यांसाठी आहे. कृपया अधिकृत ईमेल आणि पासवर्ड वापरून लॉगिन करा.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div
                role="alert"
                className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-3.5">
              {/* Email Input Field */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold text-slate-800 mb-1"
                >
                  प्रशासकीय ईमेल आयडी (Admin Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gpkomalwadi@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003625] focus:border-transparent transition bg-slate-50/40 hover:bg-white"
                  />
                </div>
              </div>

              {/* Password Input Field with Visibility Toggle */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-slate-800 mb-1"
                >
                  पासवर्ड (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003625] focus:border-transparent transition bg-slate-50/40 hover:bg-white"
                  />
                  {/* Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "पासवर्ड लपवा" : "पासवर्ड दाखवा"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs text-slate-500 hover:text-emerald-800 font-semibold hover:underline cursor-pointer transition"
                  >
                    पासवर्ड विसरलात ?
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 bg-[#003625] hover:bg-[#00261a] active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>प्रमाणीकरण सुरू आहे...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 text-emerald-300" />
                    <span>प्रशासकीय खात्यात लॉगिन करा</span>
                  </>
                )}
              </button>
            </form>

            {/* Technical Support Box at Card Bottom */}
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <Headphones className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span>तांत्रिक मदत व संपर्क</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                समर्थनासाठी ग्रामपंचायत कार्यालयाशी संपर्क साधा.
              </p>
            </div>

            {/* Mobile-only back to homepage link */}
            <div className="lg:hidden text-center pt-0.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>मुख्य संकेतस्थळावर जा</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Recovery Guidance Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  प्रशासकीय पासवर्ड रीसेट
                </h4>
                <p className="text-xs text-slate-500">
                  सुरक्षित अधिकृत प्रक्रिया
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <p>
                शासकीय सुरक्षिततेच्या कारणास्तव प्रशासक लॉगिनचा पासवर्ड परस्पर बदलण्याची किंवा रीसेट करण्याची सुविधा सार्वजनिकपणे उपलब्ध नाही.
              </p>
              <p className="font-semibold text-slate-800">
                पासवर्ड रीसेट करण्यासाठी खालीलप्रमाणे संपर्क साधा:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>ग्रामपंचायत कार्यालयीन ग्रामसेवक किंवा संगणक परिचालक</li>
                <li>पंचायत समिती सिन्नर - गट विकास अधिकारी (BDO) कक्ष</li>
                <li>जिल्हा परिषद नाशिक - ई-प्रशासन विभाग</li>
              </ul>
            </div>

            <div className="pt-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>कार्यालय: ०२५५३ - २२४४५५</span>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 bg-[#003625] text-white rounded-xl text-xs font-bold hover:bg-[#00261a] transition cursor-pointer"
              >
                समजले
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
