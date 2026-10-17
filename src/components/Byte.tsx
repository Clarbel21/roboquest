import { useEffect, useState } from 'react';

// Byte — the lab's maintenance-robot companion. Pure CSS animation.
export function Byte({
  size = 72,
  mood = 'idle',
}: {
  size?: number;
  mood?: 'idle' | 'happy' | 'sad';
}) {
  const eyeColor = mood === 'sad' ? '#D97706' : '#0284C7';
  return (
    <div className="animate-float select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* antenna */}
        <line x1="50" y1="18" x2="50" y2="6" stroke="#0EA5E9" strokeWidth="3" />
        <circle cx="50" cy="6" r="5" fill="#2DD4BF">
          <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
        </circle>
        {/* head */}
        <rect x="22" y="18" width="56" height="44" rx="14" fill="#FFFFFF" stroke="#3B9AD9" strokeWidth="2.5" />
        {/* eyes */}
        <g className="animate-blink" style={{ transformOrigin: '50px 40px' }}>
          {mood === 'happy' ? (
            <>
              <path d="M32 42 q8 -9 16 0" fill="none" stroke={eyeColor} strokeWidth="4" strokeLinecap="round" />
              <path d="M56 42 q8 -9 16 0" fill="none" stroke={eyeColor} strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="38" cy="40" r="6.5" fill={eyeColor} />
              <circle cx="62" cy="40" r="6.5" fill={eyeColor} />
            </>
          )}
        </g>
        {/* mouth */}
        {mood === 'sad' ? (
          <path d="M42 53 q8 -5 16 0" fill="none" stroke="#74889E" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <line x1="42" y1="53" x2="58" y2="53" stroke="#74889E" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* body */}
        <rect x="30" y="66" width="40" height="24" rx="9" fill="#EAF2FB" stroke="#9FBEDC" strokeWidth="2" />
        <rect x="38" y="73" width="24" height="4" rx="2" fill="#0EA5E9" opacity="0.7">
          <animate attributeName="x" values="38;44;38" dur="3s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}

export function ByteSays({ text, mood = 'idle' }: { text: string; mood?: 'idle' | 'happy' | 'sad' }) {
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(true), []);
  return (
    <div
      className={`flex items-end gap-3 transition-opacity duration-500 ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <Byte mood={mood} size={64} />
      <div className="relative mb-3 max-w-xl rounded-2xl rounded-bl-sm border border-navy-600/60 bg-white/90 px-4 py-3 text-sm text-slate-300">
        {text}
      </div>
    </div>
  );
}
