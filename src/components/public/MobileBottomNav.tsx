"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Bell, Sprout, Info } from "lucide-react";

interface Props {
  villageSlug: string;
}

export function MobileBottomNav({ villageSlug }: Props) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "मुख्य",
      href: `/${villageSlug}`,
      icon: Home,
      exact: true,
    },
    {
      label: "सेवा",
      href: `/${villageSlug}/services`,
      icon: FileText,
      exact: false,
    },
    {
      label: "योजना",
      href: `/${villageSlug}/schemes`,
      icon: Sprout,
      exact: false,
    },
    {
      label: "सूचना",
      href: `/${villageSlug}/notices`,
      icon: Bell,
      exact: false,
    },
    {
      label: "माहिती",
      href: `/${villageSlug}/about`,
      icon: Info,
      exact: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#FBF9F5] border-t border-[#E5DEC9] sm:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all select-none ${
                isActive
                  ? "text-[#9e4300] font-bold"
                  : "text-[#526056] hover:text-[#003625] font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? "bg-[#F4EFE6] text-[#9e4300] scale-110 shadow-xs border border-[#E5DEC9]" : ""
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
