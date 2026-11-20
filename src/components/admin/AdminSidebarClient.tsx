"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  FileText,
  Bell,
  BookOpen,
  Construction,
  Building2,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Search,
  Camera,
} from "lucide-react";

interface AdminSidebarClientProps {
  session: {
    name: string;
    email: string;
    role: string;
    villageSlug?: string;
    villageName?: string;
  };
  pendingCount: number;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

const PRIMARY_NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "डॅशबोर्ड",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/applications",
    label: "नागरिक अर्ज",
    icon: FileCheck2,
    hasBadge: true,
  },
  {
    href: "/admin/representatives",
    label: "पदाधिकारी व सदस्य",
    icon: Users,
  },
  {
    href: "/admin/services",
    label: "सेवा व अर्ज फॉर्म्स",
    icon: FileText,
  },
  {
    href: "/admin/notices",
    label: "सूचना फलक (Notices)",
    icon: Bell,
  },
  {
    href: "/admin/events",
    label: "घडामोडी व उपक्रम (Blog)",
    icon: Camera,
  },
  {
    href: "/admin/schemes",
    label: "शासकीय योजना",
    icon: BookOpen,
  },
  {
    href: "/admin/projects",
    label: "विकासकामे व निधी",
    icon: Construction,
  },
  {
    href: "/admin/villages",
    label: "गाव प्रोफाइल व आकडेवारी",
    icon: Building2,
  },
];

const SECONDARY_NAV_ITEMS = [
  {
    href: "/admin/applications?report=analytics",
    label: "अहवाल व विश्लेषण",
    icon: BarChart3,
  },
  {
    href: "/admin/villages",
    label: "सेटिंग्ज",
    icon: Settings,
  },
];

export function AdminSidebarClient({
  session,
  pendingCount,
  logoutAction,
  children,
}: AdminSidebarClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const villageName = session.villageName || "कोमलवाडी";

  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    const basePath = href.split("?")[0];
    return pathname === basePath || pathname.startsWith(basePath + "/");
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between min-h-0">
      {/* Top Branding Section & Menu */}
      <div className="space-y-4">
        {/* Emblem & Village Title (Centered like reference design) */}
        <div className="flex flex-col items-center text-center px-2 py-2 border-b border-emerald-900/60 pb-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-1 mb-2.5 shadow-md border-2 border-emerald-500/80 shrink-0">
            <Image
              src="/images/grampanchayat-emblem.webp"
              alt="महाराष्ट्र शासन ग्रामपंचायत बोधचिन्ह"
              width={56}
              height={56}
              unoptimized
              className="object-contain rounded-full"
            />
          </div>
          <h1 className="font-extrabold text-base sm:text-lg text-white leading-[1.4] tracking-normal break-words text-center py-0.5">
            {villageName}
            <br />
            ग्रामपंचायत
          </h1>
          <p className="text-[11px] text-emerald-300/90 font-medium leading-[1.45] mt-0.5 text-center break-words">
            प्रशासकीय नियंत्रण कक्ष
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition duration-150 ${
                  active
                    ? "bg-[#134e39] text-white font-bold shadow-sm border border-emerald-600/70"
                    : "text-emerald-100/90 hover:bg-emerald-900/50 hover:text-white font-medium"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 py-0.5">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition ${
                      active ? "text-emerald-300" : "text-emerald-400 group-hover:text-white"
                    }`}
                  />
                  <span className="leading-[1.45] tracking-normal break-words text-xs font-semibold">
                    {item.label}
                  </span>
                </div>

                {item.hasBadge && pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-black bg-amber-400 text-slate-950 rounded-full animate-pulse shadow-xs shrink-0 leading-normal">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Section Divider */}
          <div className="my-2 border-t border-emerald-900/60" />

          {SECONDARY_NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition duration-150 ${
                  active
                    ? "bg-[#134e39] text-white font-bold shadow-sm border border-emerald-600/70"
                    : "text-emerald-100/90 hover:bg-emerald-900/50 hover:text-white font-medium"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 py-0.5">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition ${
                      active ? "text-emerald-300" : "text-emerald-400 group-hover:text-white"
                    }`}
                  />
                  <span className="leading-[1.45] tracking-normal break-words text-xs font-semibold">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & External Links */}
      <div className="pt-4 border-t border-emerald-900/60 space-y-2.5 mt-auto">
        {/* Public Portal Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/80 text-emerald-200 hover:text-white text-xs font-semibold border border-emerald-800/60 transition group"
        >
          <span className="flex items-center gap-2 min-w-0 flex-1 py-0.5">
            <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="leading-[1.45] tracking-normal break-words">
              सार्वजनिक पोर्टल उघडा
            </span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
        </Link>

        {/* Administrator Profile Card */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500">
              {session.name ? session.name.charAt(0) : "प्र"}
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-xs font-bold text-white leading-[1.4] tracking-normal break-words">
                {session.name}
              </p>
              <p className="text-[10px] text-emerald-300 leading-[1.4] tracking-normal break-words">
                अधिकृत प्रशासक
              </p>
            </div>
          </div>

          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="p-1.5 rounded-lg text-red-300 hover:text-white hover:bg-red-950/80 transition cursor-pointer"
              title="लॉगआउट (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const getPageTitle = () => {
    if (pathname.includes("/admin/applications")) return "नागरिक अर्ज";
    if (pathname.includes("/admin/representatives")) return "पदाधिकारी व सदस्य";
    if (pathname.includes("/admin/services")) return "सेवा व अर्ज फॉर्म्स";
    if (pathname.includes("/admin/notices")) return "सूचना व बातम्या";
    if (pathname.includes("/admin/schemes")) return "शासकीय योजना";
    if (pathname.includes("/admin/projects")) return "विकासकामे व निधी";
    if (pathname.includes("/admin/villages")) return "गाव प्रोफाइल व आकडेवारी";
    return "डॅशबोर्ड";
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Desktop Sidebar (Left-Fixed / Sticky) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 text-white border-r border-emerald-900/80 shadow-xl overflow-hidden z-40 relative">
        {/* Fixed Footer Background Image - does not move with scroll */}
        <div
          className="absolute inset-0 z-0 footer-bg pointer-events-none"
          style={{
            backgroundImage: "url('/images/footer-background.webp')",
            backgroundPosition: "center bottom",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Emerald gradient overlay allowing scenic rural illustration to show through while maintaining high contrast text */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#003625]/88 via-[#00281b]/78 to-[#001f14]/84 pointer-events-none" />

        {/* Scrollable Navigation Content (scrolls smoothly while background remains fixed) */}
        <div className="relative z-10 flex flex-col h-full justify-between min-h-0 overflow-y-auto p-4">
          {navContent}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-gradient-to-r from-[#003625] via-[#002e1f] to-[#003625] text-white px-3 sm:px-4 py-2.5 border-b border-emerald-900/80 shadow-md flex items-center justify-between gap-2">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative w-9 h-9 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 border border-emerald-500/80 shadow-xs">
            <Image
              src="/images/grampanchayat-emblem.webp"
              alt="महाराष्ट्र शासन बोधचिन्ह"
              width={32}
              height={32}
              className="object-contain rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <h1 className="font-extrabold text-xs sm:text-sm text-white leading-[1.45] tracking-normal break-words">
              {villageName} ग्रामपंचायत
            </h1>
            <p className="text-[10px] sm:text-[11px] text-emerald-300 leading-[1.4] tracking-normal break-words">
              प्रशासकीय नियंत्रण कक्ष
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {pendingCount > 0 && (
            <Link
              href="/admin/applications"
              className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-slate-950 rounded-full animate-pulse leading-normal"
            >
              {pendingCount} अर्ज
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            aria-label="मेनू उघडा"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content (tested across 320px, 360px, 375px, 430px widths) */}
          <div className="fixed inset-y-0 left-0 w-[min(20rem,86vw)] max-w-xs sm:w-72 text-white shadow-2xl z-50 overflow-hidden flex flex-col relative border-r border-emerald-900/80">
            {/* Fixed Footer Background Image - does not move with scroll */}
            <div
              className="absolute inset-0 z-0 footer-bg pointer-events-none"
              style={{
                backgroundImage: "url('/images/footer-background.webp')",
                backgroundPosition: "center bottom",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* Emerald gradient overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#003625]/88 via-[#00281b]/78 to-[#001f14]/84 pointer-events-none" />

            {/* Scrollable Navigation Content */}
            <div className="relative z-10 flex flex-col h-full justify-between min-h-0 overflow-y-auto p-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/80 mb-3">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider leading-[1.45]">
                  प्रशासकीय मेनू
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="मेनू बंद करा"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navContent}
            </div>
          </div>
        </div>
      )}

      {/* Content Column with Desktop Top Bar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8FAF9]">
        {/* Desktop Top Header Bar matching reference image */}
        <header className="hidden lg:flex items-center justify-between px-6 xl:px-8 py-3 bg-white border-b border-slate-200/80 shadow-2xs z-30 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 leading-[1.4] tracking-normal">
              {getPageTitle()}
            </h1>
          </div>

          {/* Search bar matching reference */}
          <div className="relative w-72 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="अर्ज, योजना, नागरिक शोधा..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
            />
          </div>

          {/* Right Notifications & Profile */}
          <div className="flex items-center gap-3 xl:gap-4">
            <Link
              href="/admin/applications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="सूचना व अर्ज नोटिफिकेशन्स"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {session.name ? session.name.charAt(0) : "N"}
              </div>
              <div className="text-left text-xs leading-[1.3] py-0.5">
                <span className="font-extrabold text-slate-900 block">ग्रामपंचायत प्रशासक</span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <span>{villageName}</span>
                  <span className="text-[9px]">▾</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
