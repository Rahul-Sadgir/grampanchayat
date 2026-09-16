export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-sm w-full flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-800/20 border-t-emerald-800 animate-spin" />
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            प्रशासकीय माहिती लोड होत आहे...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            कृपया प्रतीक्षा करा...
          </p>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-800 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
