'use client';

import { Check } from 'lucide-react';

interface OptionButtonProps {
  text: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function OptionButton({ text, selected, onClick, disabled }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150
        ${selected
          ? 'border-primary bg-indigo-50 text-primary'
          : 'border-slate-200 bg-white text-text-primary hover:border-primary/50 hover:bg-slate-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        active:scale-[0.98]
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{text}</span>
        {selected && (
          <Check className="w-5 h-5 text-primary flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
