export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-gold-400 animate-pulse" />
        <div className="space-y-2 text-center">
          <div className="skeleton h-4 w-32 rounded-full" />
          <div className="skeleton h-3 w-24 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
