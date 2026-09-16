"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, navigation finished
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on internal links to provide instant feedback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore hash links, external links, downloads, mailto, tel, target="_blank"
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // If clicking the exact same URL without hash
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      setLoading(true);
      setProgress(25);

      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            if (interval) clearInterval(interval);
            return 85;
          }
          return prev + Math.floor(Math.random() * 15 + 5);
        });
      }, 150);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3.5px] bg-transparent"
    >
      {/* Glow effect & Gradient Bar */}
      <div
        className="h-full bg-gradient-to-r from-[#9e4300] via-[#F5D77F] to-[#003625] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,215,127,0.85)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 0.2s ease-out, opacity 0.3s ease-out" : "width 0.25s ease",
        }}
      />
      {/* Right spinner pulse dot */}
      {loading && progress < 100 && (
        <div
          className="absolute top-0 right-0 w-3 h-3 -mt-[4px] rounded-full bg-[#F5D77F] shadow-[0_0_8px_#F5D77F] animate-ping"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      )}
    </div>
  );
}
