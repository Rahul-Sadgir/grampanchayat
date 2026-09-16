import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileCheck2,
  Bell,
  BookOpen,
  Construction,
  Building2,
  ExternalLink,
  ShieldAlert,
  Users,
  FileText,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Navigation */}
      <nav className="bg-emerald-950 text-white px-4 sm:px-6 py-3.5 border-b border-emerald-900 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-3">
          {/* Logo / Title */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-emerald-800">
                <Image
                  src="/images/emblem.png"
                  alt="महाराष्ट्र शासन ग्रामपंचायत बोधचिन्ह"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-2">
                  <span>ग्रामपंचायत केंद्रीय प्रशासन पॅनेल</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                    Dual Village Hub
                  </span>
                </h1>
                <p className="text-[10px] text-emerald-300">
                  गुळवंच व माझगाव ग्रामपंचायत व्यवस्थापन
                </p>
              </div>
            </Link>

            {/* Quick Preview Links for mobile */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <Link
                href="/gulwanch"
                target="_blank"
                className="text-[10px] font-bold bg-emerald-900 text-emerald-200 px-2 py-1 rounded-lg border border-emerald-800 flex items-center gap-1"
              >
                गुळवंच ↗
              </Link>
              <Link
                href="/mazagaon"
                target="_blank"
                className="text-[10px] font-bold bg-emerald-900 text-emerald-200 px-2 py-1 rounded-lg border border-emerald-800 flex items-center gap-1"
              >
                माझगाव ↗
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold w-full lg:w-auto justify-start lg:justify-end overflow-x-auto pb-1 lg:pb-0">
            <Link
              href="/admin/dashboard"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>डॅशबोर्ड</span>
            </Link>

            <Link
              href="/admin/applications"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>नागरिक अर्ज</span>
            </Link>

            <Link
              href="/admin/representatives"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>पदाधिकारी व सदस्य</span>
            </Link>

            <Link
              href="/admin/services"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span>सेवा व अर्ज फॉर्म्स</span>
            </Link>

            <Link
              href="/admin/notices"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>सूचना फलक</span>
            </Link>

            <Link
              href="/admin/schemes"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>योजना</span>
            </Link>

            <Link
              href="/admin/projects"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <Construction className="w-3.5 h-3.5 text-purple-400" />
              <span>विकासकामे</span>
            </Link>

            <Link
              href="/admin/villages"
              className="px-3 py-1.5 rounded-xl hover:bg-emerald-900 text-emerald-100 hover:text-white transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>गावे व बॅनर</span>
            </Link>

            {/* Desktop Preview Badges */}
            <div className="hidden lg:flex items-center gap-1.5 ml-2 pl-2 border-l border-emerald-800">
              <Link
                href="/gulwanch"
                target="_blank"
                className="text-[11px] font-bold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-700/60 transition flex items-center gap-1"
              >
                गुळवंच <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/mazagaon"
                target="_blank"
                className="text-[11px] font-bold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-700/60 transition flex items-center gap-1"
              >
                माझगाव <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}