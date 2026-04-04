import { OTPInput, OTPInputContext } from 'input-otp';
import { useContext } from 'react';
import { cn } from '@/lib/utils';

// ── Single slot ───────────────────────────────────────────────────────────────

function Slot({ index }: { index: number }) {
  const ctx = useContext(OTPInputContext);
  const slot = ctx.slots[index];
  if (!slot) return null;
  const { char, hasFakeCaret, isActive } = slot;

  return (
    <div
      className={cn(
        'relative flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold text-slate-900 transition-all',
        isActive
          ? 'border-sage-700 ring-2 ring-sage-700/20 bg-sage-50'
          : 'border-slate-300 bg-white',
      )}
    >
      {char ?? <span className="text-slate-300">·</span>}
      {hasFakeCaret && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-px animate-caret-blink bg-sage-700 duration-1000" />
        </span>
      )}
    </div>
  );
}

// ── Separator ─────────────────────────────────────────────────────────────────

function Separator() {
  return <span className="text-slate-300 text-xl font-light select-none">—</span>;
}

// ── Public component ──────────────────────────────────────────────────────────

interface Props {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  disabled?: boolean;
  id?: string;
}

/**
 * 6-box OTP input using the `input-otp` library.
 * Splits into two groups of 3 for readability.
 */
export function OtpInput({ value, onChange, length = 6, disabled, id }: Props) {
  return (
    <OTPInput
      id={id}
      maxLength={length}
      value={value}
      onChange={onChange}
      disabled={disabled}
      containerClassName="flex items-center gap-2 justify-center"
      render={({ slots }) => (
        <>
          <div className="flex gap-2">
            {slots.slice(0, 3).map((_, i) => (
              <Slot key={i} index={i} />
            ))}
          </div>
          <Separator />
          <div className="flex gap-2">
            {slots.slice(3).map((_, i) => (
              <Slot key={i + 3} index={i + 3} />
            ))}
          </div>
        </>
      )}
    />
  );
}
