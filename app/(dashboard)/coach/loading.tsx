export default function CoachLoading() {
  return (
    <div className="flex h-screen bg-black items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-glow flex items-center justify-center text-2xl shadow-glow animate-pulse">
          🤖
        </div>
        <p className="text-sm text-muted">Loading AI Coach...</p>
      </div>
    </div>
  );
}
