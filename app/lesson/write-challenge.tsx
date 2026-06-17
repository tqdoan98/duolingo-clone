"use client";

import { cn } from "@/lib/utils";

type WriteStatus = "none" | "correct" | "wrong";

type WriteChallengeProps = {
  value: string;
  onChange: (v: string) => void;
  status: WriteStatus;
  disabled?: boolean;
};

export const WriteChallenge = ({
  value,
  onChange,
  status,
  disabled,
}: WriteChallengeProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-sm text-neutral-500">Type the English meaning</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Your answer…"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className={cn(
          "w-full rounded-xl border-2 border-b-4 p-4 text-lg outline-none transition",
          status === "none" && "border-neutral-200 focus:border-sky-300",
          status === "correct" &&
            "border-green-300 bg-green-50 text-green-700",
          status === "wrong" && "border-rose-300 bg-rose-50 text-rose-700",
          disabled && "pointer-events-none"
        )}
      />
    </div>
  );
};
