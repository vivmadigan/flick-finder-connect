export function Letterbox() {
  return (
    <div className="fixed inset-x-0 z-[99] pointer-events-none" aria-hidden="true">
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent"
        style={{ backdropFilter: 'blur(4px)' }}
      />
      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent"
        style={{ backdropFilter: 'blur(4px)' }}
      />
    </div>
  );
}
