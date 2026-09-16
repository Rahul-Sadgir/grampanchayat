"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Landmark,
  Phone,
  Search,
  Lock,
  Menu,
  X,
  Construction,
  ReceiptText,
  Coins,
  Sprout,
  Megaphone,
  Users,
  Building,
} from "lucide-react";

interface HeaderProps {
  village: {
    name: string;
    slug: string;
    taluka: string;
    district: string;
    phone?: string;
  };
}

export function Header({ village }: HeaderProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "small">("normal");
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 20);

      // Always visible near the top
      if (currentScrollY <= 40) {
        setIsVisible(true);
      }
      // Scrolling down past threshold -> hide header
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }
      // Scrolling up -> reveal header immediately
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "मुख्यपृष्ठ", href: `/${village.slug}`, exact: true },
    { label: "नागरिक सेवा", href: `/${village.slug}/services`, exact: false },
    { label: "बातम्या व सूचना", href: `/${village.slug}/notices`, exact: false },
    { label: "शासकीय योजना", href: `/${village.slug}/schemes`, exact: false },
    { label: "गावाचा विकास", href: `/${village.slug}/development`, exact: false },
    { label: "गावाबद्दल", href: `/${village.slug}/about`, exact: false },
    { label: "ग्रामपंचायत प्रतिनिधी", href: `/${village.slug}#representatives`, exact: false, isHash: true },
  ];

  const drawerItems = [
    { label: "मुख्य पृष्ठ (Home)", href: `/${village.slug}`, exact: true, icon: Landmark },
    { label: "नागरिक सेवा (Services)", href: `/${village.slug}/services`, exact: false, icon: ReceiptText },
    { label: "कर आकारणी व भरणा (Taxation)", href: `/${village.slug}/services?tab=tax`, exact: false, icon: Coins },
    { label: "शासकीय योजना (Schemes)", href: `/${village.slug}/schemes`, exact: false, icon: Sprout },
    { label: "ग्रामसभा व जाहीर सूचना (Notices)", href: `/${village.slug}/notices`, exact: false, icon: Megaphone },
    { label: "गावाचा विकास प्रकल्प (Development)", href: `/${village.slug}/development`, exact: false, icon: Construction },
    { label: "पदाधिकारी व सदस्य (Members)", href: `/${village.slug}#representatives`, exact: false, icon: Users, isHash: true },
    { label: "गावाबद्दल माहिती (About Village)", href: `/${village.slug}/about`, exact: false, icon: Building },
  ];

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-40 bg-[#FBF9F5] border-b border-[#E5DEC9] transition-transform duration-300 ease-in-out ${
          isScrolled ? "shadow-md" : "shadow-xs"
        } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        {/* 1. TOP CIVIC JURISDICTION STRIP */}
        <div className="bg-[#003625] text-white py-1 px-3 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1 opacity-90">
                <Landmark className="w-3 h-3 text-[#F5D77F]" />
                <span>महाराष्ट्र शासन • ग्रामविकास व पंचायत राज विभाग</span>
              </span>
              <span className="hidden sm:inline opacity-40">|</span>
              <span className="hidden sm:inline bg-[#134e39] px-2 py-0.5 rounded text-[#85bea3] font-semibold">
                जिल्हा: {village.district} • तालुका: {village.taluka}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Accessibility Font Size Buttons */}
              <div className="flex items-center gap-1.5 opacity-90">
                <button
                  onClick={() => setFontSize("small")}
                  className={`px-1 hover:text-[#F5D77F] transition ${fontSize === "small" ? "text-[#F5D77F] font-bold" : ""}`}
                  title="Zoom Out"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("normal")}
                  className={`px-1 hover:text-[#F5D77F] transition ${fontSize === "normal" ? "text-[#F5D77F] font-bold" : ""}`}
                  title="Normal"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`px-1 hover:text-[#F5D77F] transition ${fontSize === "large" ? "text-[#F5D77F] font-bold" : ""}`}
                  title="Zoom In"
                >
                  A+
                </button>
              </div>
              <span className="opacity-40">|</span>
              <span className="text-[11px] font-semibold text-[#F5D77F]">
                मराठी (MR)
              </span>
            </div>
          </div>
        </div>

        {/* 2. MAIN CIVIC IDENTITY ROW */}
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Village Brand Identity with Emblem */}
          <Link href={`/${village.slug}`} className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/images/emblem.png"
                alt="महाराष्ट्र शासन ग्रामपंचायत अधिकृत बोधचिन्ह"
                width={48}
                height={48}
                priority
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-[#003625] text-sm sm:text-lg md:text-xl tracking-tight leading-tight truncate">
                  {village.name} ग्रामपंचायत
                </h1>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#F4EFE6] text-[#9e4300] border border-[#E5DEC9] hidden sm:inline-block">
                  अधिकृत पोर्टल
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#526056] font-medium truncate">
                ता. {village.taluka}, जि. {village.district} • आपलं गाव • आपल्या सेवा
              </p>
            </div>
          </Link>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Citizen Helpline Card (Desktop) */}
            {village.phone && (
              <a
                href={`tel:${village.phone}`}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F4EFE6] text-[#9e4300] border border-[#E5DEC9] hover:bg-[#ebeef3] transition"
              >
                <Phone className="w-4 h-4 text-[#9e4300]" />
                <div className="text-left leading-tight">
                  <span className="text-[9px] text-[#526056] uppercase font-bold block">
                    नागरिक मदत कक्ष
                  </span>
                  <span className="font-extrabold text-xs text-[#1E2621]">
                    {village.phone}
                  </span>
                </div>
              </a>
            )}

            {/* Search link for mobile & desktop */}
            <Link
              href={`/${village.slug}/services`}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#003625] hover:bg-[#F4EFE6] border border-[#E5DEC9] transition"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>


            {/* Admin Login (Desktop) */}
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#134e39] text-white hover:bg-[#003625] font-semibold text-xs transition"
            >
              <Lock className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span>प्रशासक</span>
            </Link>

            {/* Mobile Civic Drawer Toggle Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg bg-[#F4EFE6] text-[#003625] border border-[#E5DEC9] transition active:scale-95 cursor-pointer"
              aria-label="Open Civic Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3. HORIZONTAL CIVIC NAVIGATION BAR (DESKTOP) */}
        <div className="hidden md:block bg-[#F4EFE6] border-t border-[#E5DEC9]">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto text-xs text-[#526056]">
              {navItems.map((item) => {
                const isActive = item.isHash
                  ? false
                  : item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2.5 transition-all whitespace-nowrap select-none ${
                      isActive
                        ? "text-[#9e4300] border-b-2 border-[#9e4300] font-extrabold bg-[#E5DEC9]/40"
                        : "hover:text-[#003625] hover:bg-black/5 font-bold text-[#526056]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* 4. CIVIC DRAWER (नागरिक सेवा दालन - Mobile Side Sheet matching Stitch UI) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="absolute top-0 right-0 h-full w-4/5 max-w-xs bg-[#FBF9F5] shadow-2xl flex flex-col z-10 border-l border-[#E5DEC9]">
            {/* Drawer Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-[#134e39] text-white">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#F5D77F]" />
                <span className="font-extrabold text-sm text-[#FBF9F5]">नागरिक सेवा दालन</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-white hover:bg-[#003625] transition cursor-pointer"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 text-xs font-semibold text-[#1E2621]">
              <p className="text-[10px] text-[#9e4300] uppercase font-bold tracking-wider px-2 py-1">
                प्रशासकीय विभाग
              </p>

              {drawerItems.map((item) => {
                const isActive = item.isHash
                  ? false
                  : item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const IconComponent = item.icon;


                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-[#003625] text-white font-extrabold shadow-2xs"
                        : "hover:bg-[#F4EFE6] text-[#1E2621] font-semibold"
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 ${
                        isActive ? "text-[#F5D77F]" : "text-[#003625]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Emergency Helpline Box at bottom of drawer */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#F4EFE6] border border-[#E5DEC9] space-y-1">
                <p className="text-xs font-bold text-[#003625]">आपत्कालीन संपर्क (Helpline)</p>
                <p className="text-[11px] text-[#526056]">
                  ग्रामसेवक थेट: {village.phone || "०२५५३-२२४४५५"}
                </p>
                <a
                  href={`tel:${village.phone || "02553224455"}`}
                  className="inline-block mt-1 text-[11px] font-bold text-[#9e4300] hover:underline"
                >
                  थेट कॉल करा →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}