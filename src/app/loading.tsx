export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F7F5F0]">
      <div className="flex flex-col items-center gap-4">
        <div 
          className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-stone-800" 
        />
        <p className="text-sm font-medium tracking-widest text-stone-600 uppercase">
          Yükleniyor...
        </p>
      </div>
    </div>
  );
}
