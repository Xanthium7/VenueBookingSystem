"use client";
import { cn } from "@/lib/utils";

export function SkeletonList({ view }: { view: "list" | "grid" }) {
  const items = Array.from({ length: 4 });
  return (
    <div
      className={cn(
        view === "grid"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"
      )}
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-neutral-900/30 p-5 h-48"
        >
          <div className="h-5 w-40 bg-neutral-300/50 dark:bg-neutral-700/50 rounded" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full bg-neutral-300/40 dark:bg-neutral-700/40 rounded" />
            <div className="h-3 w-2/3 bg-neutral-300/40 dark:bg-neutral-700/40 rounded" />
            <div className="h-3 w-1/2 bg-neutral-300/40 dark:bg-neutral-700/40 rounded" />
          </div>
          <div className="mt-6 flex gap-3">
            <div className="h-8 w-20 bg-neutral-300/50 dark:bg-neutral-700/50 rounded-full" />
            <div className="h-8 w-20 bg-neutral-300/50 dark:bg-neutral-700/50 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
