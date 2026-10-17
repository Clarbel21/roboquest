import type { ReactNode } from 'react';
import type { Category } from '../engine/types';

// Shared presentational primitives. Accent styles are static class strings so
// Tailwind's JIT compiler sees every variant.

export const ACCENT: Record<
  Category['accent'],
  { text: string; chip: string; border: string; bar: string; glow: string }
> = {
  sky: { text: 'text-sky-700', chip: 'bg-sky-400/10', border: 'border-sky-400/30', bar: 'bg-sky-400', glow: 'shadow-[0_0_18px_rgba(56,189,248,0.15)]' },
  teal: { text: 'text-teal-700', chip: 'bg-teal-400/10', border: 'border-teal-400/30', bar: 'bg-teal-400', glow: 'shadow-[0_0_18px_rgba(45,212,191,0.15)]' },
  violet: { text: 'text-violet-700', chip: 'bg-violet-400/10', border: 'border-violet-400/30', bar: 'bg-violet-400', glow: 'shadow-[0_0_18px_rgba(167,139,250,0.15)]' },
  amber: { text: 'text-amber-700', chip: 'bg-amber-400/10', border: 'border-amber-400/30', bar: 'bg-amber-400', glow: 'shadow-[0_0_18px_rgba(251,191,36,0.15)]' },
  emerald: { text: 'text-emerald-700', chip: 'bg-emerald-400/10', border: 'border-emerald-400/30', bar: 'bg-emerald-400', glow: 'shadow-[0_0_18px_rgba(52,211,153,0.15)]' },
  rose: { text: 'text-rose-700', chip: 'bg-rose-400/10', border: 'border-rose-400/30', bar: 'bg-rose-400', glow: 'shadow-[0_0_18px_rgba(251,113,133,0.15)]' },
  indigo: { text: 'text-indigo-700', chip: 'bg-indigo-400/10', border: 'border-indigo-400/30', bar: 'bg-indigo-400', glow: 'shadow-[0_0_18px_rgba(129,140,248,0.15)]' },
  cyan: { text: 'text-cyan-700', chip: 'bg-cyan-400/10', border: 'border-cyan-400/30', bar: 'bg-cyan-400', glow: 'shadow-[0_0_18px_rgba(34,211,238,0.15)]' },
};

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-navy-600/60 bg-navy-900/70 backdrop-blur-sm p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'subtle' | 'danger';
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const styles = {
    primary:
      'bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-glow disabled:bg-navy-700 disabled:text-slate-500 disabled:shadow-none',
    ghost:
      'border border-navy-600 text-slate-600 hover:border-cyan-400/50 hover:text-cyan-800 disabled:opacity-40',
    subtle: 'bg-navy-700/80 text-slate-200 hover:bg-navy-600 disabled:opacity-40',
    danger: 'border border-rose-400/40 text-rose-700 hover:bg-rose-400/10',
  }[variant];
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({
  value,
  accent = 'sky',
  className = '',
}: {
  value: number;
  accent?: Category['accent'] | 'cyan';
  className?: string;
}) {
  const color = accent === 'cyan' ? 'bg-cyan-400' : ACCENT[accent].bar;
  return (
    <div className={`h-1.5 w-full rounded-full bg-navy-700 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, Math.round(value * 100)))}%` }}
      />
    </div>
  );
}

export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

// Markdown-lite renderer: **bold**, `code`, blank-line paragraphs, "- " bullets.
export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className={`space-y-3 text-sm leading-relaxed text-slate-200 ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
                  <span>{inline(l.trim().slice(2))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{lines.map((l, j) => <span key={j}>{j > 0 && <br />}{inline(l)}</span>)}</p>;
      })}
    </div>
  );
}

function inline(text: string): ReactNode[] {
  // Split on **bold** and `code` tokens.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-navy-700/80 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-navy-600/60 bg-abyss/80 p-4 font-mono text-[13px] leading-relaxed text-slate-200">
      {language && <div className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">{language}</div>}
      <code>{code}</code>
    </pre>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">{children}</h2>
      {right}
    </div>
  );
}
