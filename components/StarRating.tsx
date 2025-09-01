"use client";
import { type ReactNode } from "react";

export function StarRating({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  const clamped = Math.min(Math.max(rating, 0), 5);
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.25 && clamped - full < 0.75;
  const empty = 5 - full - (half ? 1 : 0);
  const stars: ReactNode[] = [];
  for (let i = 0; i < full; i++)
    stars.push(<Star key={"f" + i} filled size={size} />);
  if (half) stars.push(<Star key="h" half size={size} />);
  for (let i = 0; i < empty; i++)
    stars.push(<Star key={"e" + i} size={size} />);
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating: ${clamped.toFixed(1)} out of 5`}
    >
      {stars}
      <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
        {clamped.toFixed(1)}
      </span>
    </div>
  );
}

function Star({
  filled,
  half,
  size,
}: {
  filled?: boolean;
  half?: boolean;
  size: number;
}) {
  if (half) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="text-amber-400 drop-shadow"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="halfGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          fill="url(#halfGrad)"
          stroke="currentColor"
          strokeWidth="1.2"
          d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={
        filled
          ? "text-amber-400 drop-shadow"
          : "text-neutral-300 dark:text-neutral-600"
      }
      aria-hidden="true"
    >
      <path
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.4}
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  );
}
