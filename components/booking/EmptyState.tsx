"use client";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center border border-dashed rounded-2xl bg-white/40 dark:bg-neutral-900/30 border-neutral-300/60 dark:border-neutral-700/60">
      <div className="text-5xl mb-4">📅</div>
      <h3 className="text-lg font-semibold tracking-tight mb-2">
        No bookings yet
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
        Once you reserve a venue, it will appear here. Head back to the homepage
        to explore available spaces.
      </p>
      <Button
        size="sm"
        className="mt-6 rounded-full"
        onClick={() => (window.location.href = "/")}
      >
        Browse Venues
      </Button>
    </div>
  );
}
