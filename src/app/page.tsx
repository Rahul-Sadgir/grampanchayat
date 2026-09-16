import Link from "next/link";
import Image from "next/image";
import { getAllVillages } from "@/lib/data-provider";
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Lock,
  Sparkles,
  MapPin,
  FileText,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RootGatewayPage() {
  const villages = await getAllVillages();

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900">
      {/* Top Banner */}
      <header className="bg-emerald-950 text-white px-4 py-3.5 border-b border-emerald-900 shadow-xs">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-sm">
              ग्रा
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base leading-tight">
                डिजिटल ग्रामपंचायत महापोर्टल
              </h1>
              <p className="text-[10px] text-emerald-300">
                तालुका: सिन्नर, जिल्हा: नाशिक • महाराष्ट्र शासन
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-700 flex items-center gap-1.5 transition"
          >
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">प्रशासकीय लॉगिन</span>
            <span className="sm:hidden">प्रशासन</span>
          </Link>
        </div>
      </header>

      {/* Hero Welcome */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>आपले गाव निवडा • नागरिक ई-सेवा</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ग्रामपंचायत डिजिटल सेवा पोर्टल
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            खालीलपैकी आपल्या गावाच्या नावावर क्लिक करून अधिकृत ग्रामपंचायत पोर्टलवर प्रवेश करा.
          </p>
        </div>

        {/* Village Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {villages.map((v: any) => (
            <Link
              key={v._id.toString()}
              href={`/${v.slug}`}
              className="group p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-5 active:scale-[0.99]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white font-bold flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                    {v.name.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    अधिकृत पोर्टल
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition">
                    {v.name} ग्रामपंचायत
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>ता. {v.taluka}, जि. {v.district}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>पोर्टल उघडा</span>
                <span className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">सर्व दाखले ऑनलाइन</h4>
              <p className="text-[11px] text-slate-500">जन्म, मृत्यू, रहिवासी, नळ जोडणी</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">डिजिटल व सुलभ सेवा</h4>
              <p className="text-[11px] text-slate-500">सर्व शासकीय सेवा एकाच ठिकाणी</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">पारदर्शक कारभार</h4>
              <p className="text-[11px] text-slate-500">योजना व विकासकामांचा तपशील</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full relative footer-bg text-slate-800 border-t border-slate-200 overflow-hidden"
      >
        <div className="w-full bg-[#FBF9F5]/90 backdrop-blur-[0.5px] py-8 text-center text-xs text-slate-700">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-semibold text-[#003625]">© {new Date().getFullYear()} डिजिटल ग्रामपंचायत प्लॅटफॉर्म. सर्व हक्क राखीव.</p>
            <p className="text-[11px] text-slate-600 font-medium">महाराष्ट्र शासन ग्रामीण विकास व पंचायत राज विभाग संकल्पना</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
