import { queryOne, queryMany } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  BarChart3,
  BookOpen,
  Construction,
  MapPin,
  Home,
  Check,
  ChevronRight,
  Info,
  Zap,
  Bell,
  Camera,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { getAllVillages } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const villages = await getAllVillages();
  const villageSlug = session.villageSlug || "komalwadi";
  const village = villages.find((v: any) => v.slug === villageSlug) || villages[0];

  let totalApps = 0;
  let pendingApps = 0;
  let approvedApps = 0;
  let rejectedApps = 0;
  let recentApplications: any[] = [];
  let recentNotices: any[] = [];

  // Monthly data initialized with current month and 5 past months (6 months total)
  const now = new Date();
  const monthBuckets: { year: number; month: number; name: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleDateString("mr-IN", { month: "short" });
    monthBuckets.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      name: monthName,
      count: 0,
    });
  }

  try {
    const countsRes = await queryOne(
      `SELECT 
        COUNT(*) as total_apps,
        COUNT(*) FILTER (WHERE status IN ('SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'DOCUMENTS_SUBMITTED')) as pending_apps,
        COUNT(*) FILTER (WHERE status IN ('APPROVED', 'COMPLETED')) as approved_apps,
        COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected_apps
       FROM applications
       WHERE LOWER(village_slug) = LOWER($1)`,
      [villageSlug]
    );

    totalApps = Number(countsRes?.totalApps || 0);
    pendingApps = Number(countsRes?.pendingApps || 0);
    approvedApps = Number(countsRes?.approvedApps || 0);
    rejectedApps = Number(countsRes?.rejectedApps || 0);

    const [appsList, noticesList] = await Promise.all([
      queryMany(
        `SELECT a.*, s.name as service_name_resolved
         FROM applications a
         LEFT JOIN services s ON a.service_id = s.id
         WHERE LOWER(a.village_slug) = LOWER($1)
         ORDER BY a.submitted_at DESC
         LIMIT 5`,
        [villageSlug]
      ),
      queryMany(
        `SELECT * FROM notices
         WHERE LOWER(village_slug) = LOWER($1) AND is_active = true
         ORDER BY is_important DESC, published_at DESC
         LIMIT 3`,
        [villageSlug]
      ),
    ]);

    recentApplications = appsList;
    recentNotices = noticesList;

    // Real Monthly Aggregation from PostgreSQL Application table
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyAgg = await queryMany(
      `SELECT 
        EXTRACT(YEAR FROM submitted_at)::int as yr,
        EXTRACT(MONTH FROM submitted_at)::int as mo,
        COUNT(*)::int as cnt
       FROM applications
       WHERE LOWER(village_slug) = LOWER($1)
         AND submitted_at >= $2
       GROUP BY yr, mo`,
      [villageSlug, sixMonthsAgo]
    );

    for (const item of monthlyAgg) {
      const bucket = monthBuckets.find(
        (b) => b.year === item.yr && b.month === item.mo
      );
      if (bucket) {
        bucket.count = item.cnt;
      }
    }
  } catch (err) {
    console.warn("[Dashboard] PostgreSQL database queries failed:", err);
  }

  const monthlyData = monthBuckets.map((b) => ({ name: b.name, count: b.count }));

  // Calculate dynamic percentages for the Donut Chart based purely on database counts
  const totalSafe = totalApps > 0 ? totalApps : 1;
  const approvedPct = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(1) : "0.0";
  const pendingPct = totalApps > 0 ? ((pendingApps / totalApps) * 100).toFixed(1) : "0.0";
  const rejectedPct = totalApps > 0 ? ((rejectedApps / totalApps) * 100).toFixed(1) : "0.0";

  // SVG Donut calculation: Circumference for radius r=54
  const donutR = 54;
  const strokeWidth = 14;
  const donutC = 2 * Math.PI * donutR; // ~339.29
  const approvedDash = totalApps > 0 ? (approvedApps / totalSafe) * donutC : 0;
  const pendingDash = totalApps > 0 ? (pendingApps / totalSafe) * donutC : 0;
  const rejectedDash = totalApps > 0 ? (rejectedApps / totalSafe) * donutC : 0;

  const approvedOffset = 0;
  const pendingOffset = -approvedDash;
  const rejectedOffset = -(approvedDash + pendingDash);

  // SVG Line Chart coordinates calculation for viewBox 0 0 500 240 based strictly on DB data
  const maxCount = Math.max(...monthlyData.map((d) => d.count), 0);
  const chartMax = maxCount > 0 ? maxCount : 10;
  const chartScaleY = chartMax <= 10 ? 10 : chartMax <= 50 ? 50 : Math.ceil(chartMax / 100) * 100;
  const chartPoints = monthlyData.map((item, idx) => {
    const x = 50 + idx * 80; // 50 to 450
    const yRatio = chartScaleY > 0 ? Math.min(1, item.count / chartScaleY) : 0;
    const y = 200 - yRatio * 155; // 200 (at 0) to 45 (at max)
    return { x, y, count: item.count, name: item.name };
  });

  // Construct smooth SVG spline path
  let pathD = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
  for (let i = 0; i < chartPoints.length - 1; i++) {
    const p0 = chartPoints[i];
    const p1 = chartPoints[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${chartPoints[chartPoints.length - 1].x} 200 L ${chartPoints[0].x} 200 Z`;

  // Grid step calculation
  const gridStep = chartScaleY / 5;
  const gridValues = [0, 1, 2, 3, 4, 5].map((s) => Math.round(s * gridStep));

  // Demographics stats directly from Village record in PostgreSQL (No hardcoded mock fallbacks)
  const population = village?.population || "—";
  const households = village?.households || "—";
  const area = village?.area || "—";
  const wards = village?.wards || "—";

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER CARD (Soft mint with panoramic village landscape blending right) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#F0F7F2] border border-emerald-100 shadow-2xs flex flex-col md:flex-row items-center justify-between min-h-[220px]">
        {/* Right Landscape Image with Soft Blend */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 lg:w-1/2 pointer-events-none">
          <Image
            src="/images/village-hero-banner.webp"
            alt="कोमलवाडी ग्राम दृश्य"
            fill
            className="object-cover object-right"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F0F7F2] via-[#F0F7F2]/80 to-transparent" />
        </div>

        {/* Left Content */}
        <div className="relative z-10 p-6 sm:p-8 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold border border-emerald-200 shadow-2xs">
            <Image
              src="/images/grampanchayat-emblem.webp"
              alt="महाराष्ट्र शासन बोधचिन्ह"
              width={20}
              height={20}
              unoptimized
              className="rounded-full shrink-0"
            />
            <span>{village?.name || "कोमलवाडी"} ग्रामपंचायत</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-[1.4] tracking-normal break-words">
            आपल्या गावाचा डिजिटल प्रशासकीय केंद्र
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-[1.45] break-words">
            गाव विकास, सेवा, योजना आणि नागरिक सुविधा – एकाच ठिकाणी.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/admin/services"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003625] hover:bg-[#00261a] text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन नागरिक अर्ज</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#003625] text-xs font-bold border border-slate-300 shadow-2xs transition"
            >
              <Building2 className="w-4 h-4 text-[#003625]" />
              <span>गावाची माहिती पहा →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. TOP 4 KPI CARDS (Real counts from database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 leading-[1.4]">
              एकूण नागरिक अर्ज
            </span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-normal leading-[1.4] mt-2">
            {totalApps.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-emerald-700">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>सर्व सेवांतर्गत प्राप्त अर्ज</span>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 leading-[1.4]">
              प्रलंबित अर्ज
            </span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-normal leading-[1.4] mt-2">
            {pendingApps.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            <span>तपासणी व मंजुरी प्रक्रियेत</span>
          </div>
        </div>

        {/* Approved Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 leading-[1.4]">
              मंजूर अर्ज
            </span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-normal leading-[1.4] mt-2">
            {approvedApps.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>दाखला वितरण पूर्ण</span>
          </div>
        </div>

        {/* Rejected Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 leading-[1.4]">
              नाकारित अर्ज
            </span>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-normal leading-[1.4] mt-2">
            {rejectedApps.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-rose-700">
            <XCircle className="w-3.5 h-3.5" />
            <span>अपूर्ण किंवा अपात्र अर्ज</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (Left: 8 cols, Right: 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================== LEFT COLUMN (8 cols) ==================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card A: ग्रामपंचायतीची एकूण स्थिती (Line & Donut Analytics) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-[1.4]">
                    ग्रामपंचायतीची एकूण स्थिती
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-[1.4]">
                    महत्त्वाचे आकडे आणि प्रगती
                  </p>
                </div>
              </div>

              {/* Filter */}
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-default">
                <span>मागील ६ महिने</span>
                <span className="text-[10px]">▾</span>
              </div>
            </div>

            {/* Split row: Line Chart (left) & Donut Chart (right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
              {/* Spline Line Chart (md:col-span-7) */}
              <div className="md:col-span-7 relative flex flex-col justify-between">
                {/* Floating tooltip badge over latest month */}
                <div className="absolute top-[32px] right-[24px] bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-[11px] px-2.5 py-1 rounded-lg shadow-xs pointer-events-none text-center leading-[1.3] z-10">
                  <div>{monthlyData[5].count} अर्ज</div>
                  <div className="text-[9px] text-emerald-700 font-bold">({monthlyData[5].name})</div>
                </div>

                <div className="w-full h-56">
                  <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines scaled to actual application counts */}
                    {gridValues.map((val) => {
                      const y = 200 - (val / chartScaleY) * 155;
                      return (
                        <g key={val}>
                          <line
                            x1="45"
                            y1={y}
                            x2="465"
                            y2={y}
                            stroke="#E2E8F0"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <text
                            x="35"
                            y={y + 3}
                            textAnchor="end"
                            fontSize="10"
                            fill="#94A3B8"
                            fontFamily="monospace"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient Area Fill */}
                    <path d={areaD} fill="url(#emeraldArea)" />

                    {/* Smooth Spline Stroke */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {chartPoints.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#10B981"
                        strokeWidth="2.5"
                      />
                    ))}

                    {/* X-Axis Month Labels */}
                    {chartPoints.map((p, idx) => (
                      <text
                        key={idx}
                        x={p.x}
                        y="225"
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748B"
                        fontWeight="600"
                      >
                        {p.name}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Donut Chart (md:col-span-5) */}
              <div className="md:col-span-5 flex flex-col items-center justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm text-center mb-1">
                  अर्जांची स्थिती
                </h4>

                <div className="relative w-40 h-40 flex items-center justify-center my-2">
                  <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                    {/* Background circle track */}
                    <circle
                      cx="70"
                      cy="70"
                      r={donutR}
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth={strokeWidth}
                    />
                    {/* Approved segment (Green) */}
                    {approvedApps > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={donutR}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${approvedDash} ${donutC}`}
                        strokeDashoffset={approvedOffset}
                        strokeLinecap="round"
                      />
                    )}
                    {/* Pending segment (Amber) */}
                    {pendingApps > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={donutR}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${pendingDash} ${donutC}`}
                        strokeDashoffset={pendingOffset}
                        strokeLinecap="round"
                      />
                    )}
                    {/* Rejected segment (Rose) */}
                    {rejectedApps > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={donutR}
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${rejectedDash} ${donutC}`}
                        strokeDashoffset={rejectedOffset}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>

                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-900 font-mono tracking-tight leading-none">
                      {totalApps.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5">
                      एकूण अर्ज
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="w-full space-y-1.5 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span className="text-slate-700">मंजूर ({approvedPct}%)</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {approvedApps.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                      <span className="text-slate-700">प्रलंबित ({pendingPct}%)</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {pendingApps.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                      <span className="text-slate-700">नाकारित ({rejectedPct}%)</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {rejectedApps.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: महत्त्वाची आकडेवारी (Demographics from Village Database) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base leading-[1.4] flex items-center gap-1.5">
                <span>महत्त्वाची आकडेवारी</span>
                <Info className="w-4 h-4 text-slate-400" />
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 pt-1">
              {/* Population */}
              <div className="pt-2 sm:pt-0 sm:px-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 font-medium block leading-[1.4]">
                  एकूण लोकसंख्या
                </span>
                <strong className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                  {population}
                </strong>
              </div>

              {/* Households */}
              <div className="pt-2 sm:pt-0 sm:px-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                  <Home className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 font-medium block leading-[1.4]">
                  एकूण कुटुंबे
                </span>
                <strong className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                  {households}
                </strong>
              </div>

              {/* Area */}
              <div className="pt-2 sm:pt-0 sm:px-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 font-medium block leading-[1.4]">
                  ग्राम क्षेत्र
                </span>
                <strong className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                  {area}
                </strong>
              </div>

              {/* Wards */}
              <div className="pt-2 sm:pt-0 sm:px-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 font-medium block leading-[1.4]">
                  एकूण वॉर्ड
                </span>
                <strong className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                  {wards}
                </strong>
              </div>
            </div>
          </div>

          {/* Card C: अलिकडील नागरिक अर्ज (Recent Applications Table) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-[1.4]">
                    अलिकडील नागरिक अर्ज
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-[1.4]">
                    अलीकडे प्राप्त झालेले अर्ज
                  </p>
                </div>
              </div>

              <Link
                href="/admin/applications"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition"
              >
                <span>सर्व अर्ज पहा →</span>
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3.5">अर्ज क्र.</th>
                    <th className="py-3 px-3.5">नागरिकाचे नाव</th>
                    <th className="py-3 px-3.5">सेवा / अर्ज प्रकार</th>
                    <th className="py-3 px-3.5">स्थिती</th>
                    <th className="py-3 px-3.5">दिनांक</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        कोणतेही अर्ज अद्याप प्राप्त झालेले नाहीत.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app: any) => {
                      const isApproved = app.status === "APPROVED" || app.status === "COMPLETED";
                      const isPending =
                        app.status === "SUBMITTED" ||
                        app.status === "PENDING" ||
                        app.status === "UNDER_REVIEW" ||
                        app.status === "DOCUMENTS_REQUIRED" ||
                        app.status === "DOCUMENTS_SUBMITTED";

                      return (
                        <tr key={(app.id || app._id).toString()} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                            {app.applicationNumber}
                          </td>
                          <td className="py-3 px-3.5 font-semibold text-slate-900">
                            {app.applicantName}
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 font-medium">
                            {app.serviceId?.name || app.serviceName || "दाखला अर्ज"}
                          </td>
                          <td className="py-3 px-3.5">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>मंजूर</span>
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>प्रलंबित</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3" />
                                <span>नाकारित</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-slate-500 font-medium">
                            {app.submittedAt
                              ? new Date(app.submittedAt).toLocaleDateString("mr-IN", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN (4 cols) ==================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: त्वरित कृती (Quick Actions) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
              <h3 className="font-extrabold text-slate-900 text-base leading-[1.4]">
                त्वरित कृती (Quick Actions)
              </h3>
            </div>

            <div className="space-y-3">
              {/* Action 1 */}
              <Link
                href="/admin/services"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#E8F5E9]/50 hover:bg-[#E8F5E9] border border-emerald-100 transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-200/70 text-emerald-900 flex items-center justify-center font-black text-lg shrink-0">
                    +
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-[1.4]">
                      नवीन अर्ज नोंदवा
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-[1.3]">
                      नागरिकांकडून नवीन अर्ज स्वीकारा
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
              </Link>

              {/* Action 2 */}
              <Link
                href="/admin/services"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#F3E8FF]/40 hover:bg-[#F3E8FF]/70 border border-purple-100 transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-200/70 text-purple-900 flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-[1.4]">
                      नोंदणी/प्रमाणपत्र तयार करा
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-[1.3]">
                      उदा. रहिवासी, उत्पन्न, जातीचे प्रमाणपत्र
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition" />
              </Link>

              {/* Action 3 */}
              <Link
                href="/admin/schemes"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#E0F2FE]/50 hover:bg-[#E0F2FE] border border-sky-100 transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-200/70 text-sky-900 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-[1.4]">
                      योजनेत नागरिकाची नोंदणी
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-[1.3]">
                      शासकीय योजनांसाठी अर्ज करा
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-0.5 transition" />
              </Link>

              {/* Action 4 */}
              <Link
                href="/admin/projects"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#FFEDD5]/50 hover:bg-[#FFEDD5] border border-orange-100 transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-200/70 text-orange-900 flex items-center justify-center shrink-0">
                    <Construction className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-[1.4]">
                      विकासकामे अपडेट करा
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-[1.3]">
                      कामांची स्थिती व प्रगती नोंदवा
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-700 group-hover:translate-x-0.5 transition" />
              </Link>

              {/* Action 5 */}
              <Link
                href="/admin/events"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-200/70 text-emerald-900 flex items-center justify-center shrink-0">
                    <Camera className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-[1.4]">
                      गावातील घडामोडी व ब्लॉग पोस्ट
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-[1.3]">
                      नवीन उपक्रम, फोटो (Cloudinary) व बातमी जोडा
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>

          {/* Card 2: सूचना व अपडेट्स (Notices & Updates from DB) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-base leading-[1.4]">
                  सूचना व अपडेट्स
                </h3>
              </div>
              <Link href="/admin/notices" className="text-xs font-bold text-emerald-800 hover:underline">
                सर्व पहा
              </Link>
            </div>

            <div className="space-y-4 pt-1">
              {recentNotices.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  सध्या कोणतीही जाहीर सूचना नाही.
                </div>
              ) : (
                recentNotices.map((n: any, idx: number) => {
                  const iconColors = [
                    "bg-amber-100 text-amber-800",
                    "bg-purple-100 text-purple-800",
                    "bg-emerald-100 text-emerald-800",
                  ];
                  const chosenColor = iconColors[idx % iconColors.length];

                  return (
                    <div key={n._id.toString()} className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${chosenColor} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-[1.4] break-words">
                          {n.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-[1.4] break-words">
                          {n.content}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(n.publishedAt || n.createdAt).toLocaleDateString("mr-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
