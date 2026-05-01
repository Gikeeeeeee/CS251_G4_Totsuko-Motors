export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* วงกลมหมุนๆ */}
      <div className="w-12 h-12 border-4 border-[#0b2c4a]/20 border-t-[#0b2c4a] rounded-full animate-spin"></div>
      {/* ข้อความประกอบ */}
      <p className="text-[#0b2c4a] font-medium animate-pulse text-sm">loading...</p>
    </div>
  );
}