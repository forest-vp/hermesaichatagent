'use client';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
      >
        <rect x="2" y="2" width="28" height="28" rx="8" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="16" cy="16" r="8" stroke="#60A5FA" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="3" fill="#60A5FA" />
        <line x1="16" y1="6" x2="16" y2="8" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="24" x2="16" y2="26" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="16" x2="8" y2="16" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="16" x2="26" y2="16" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-white">
        Goal<span className="text-primary">ify</span>
      </span>
    </div>
  );
}
