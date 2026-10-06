"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Building2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { loginAdminAction } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@panchayat.gov.in");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
        setErrorMsg(res.error || "लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-3 border-b border-emerald-900/60">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-emerald-800">
            <Image
              src="/images/emblem.webp"
              alt="महाराष्ट्र शासन बोधचिन्ह"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white leading-tight">
              डिजिटल ग्रामपंचायत महापोर्टल
            </h1>
            <p className="text-[10px] text-emerald-300">
              महाराष्ट्र शासन • ग्रामीण विकास विभाग
            </p>
          </div>
        </Link>

        <Link
          href="/komalwadi"
          className="text-xs font-bold text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl bg-emerald-900/40 border border-emerald-800/80 transition"
        >
          कोमलवाडी पोर्टल ↗
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-900/20 space-y-6">
          {/* Header & Village Identification */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-8 h-8 text-emerald-300" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>एक प्रशासक = एकच गाव लॉगिन (Single Village Login)</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              कोमलवाडी ग्रामपंचायत
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              अधिकृत प्रशासकीय नियंत्रण कक्ष (Admin Console)
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>सुरक्षा धोरण:</strong> या पोर्टलवर प्रत्येक प्रशासकाचे लॉगिन केवळ त्यांच्या नियुक्त एकाच गावासाठी राखीव आहे. ड्युएल किंवा मल्टिपल गाव लॉगिन अनुज्ञेय नाही.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                प्रशासकीय ईमेल आयडी (Admin Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@panchayat.gov.in"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>प्रमाणीकरण सुरू आहे...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>कोमलवाडी प्रशासक लॉगिन करा</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800">
              प्रशासक लॉगिन क्रेडेंशियल:
            </p>
            <p className="font-mono text-emerald-800 font-bold mt-0.5">
              admin@panchayat.gov.in / Admin@12345
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-emerald-300/80 py-3 border-t border-emerald-900/60">
        © {new Date().getFullYear()} डिजिटल ग्रामपंचायत प्लॅटफॉर्म • कोमलवाडी ग्रामपंचायत
      </footer>
    </div>
  );
}
