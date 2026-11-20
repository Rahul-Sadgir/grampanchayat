import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center mx-auto mb-4 border border-[#E5DEC9]">
        <Landmark className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#003625] mb-2">पृष्ठ सापडले नाही (४०४)</h1>
      <p className="text-sm text-[#526056] max-w-md mb-6">
        आपण शोधत असलेले पृष्ठ उपलब्ध नाही किंवा काढण्यात आले आहे. ग्रामपंचायत कोमलवाडीच्या मुख्य पृष्ठावर जाण्यासाठी खालील बटणावर क्लिक करा.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003625] text-white text-xs font-bold hover:bg-[#134e39] transition"
      >
        <ArrowLeft className="w-4 h-4 text-[#F5D77F]" />
        <span>मुख्यपृष्ठावर परत जा</span>
      </Link>
    </div>
  );
}

