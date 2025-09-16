"use client";
import { cn } from "@/lib/utils";
import { BookingItem } from "./types";

export function StatusBadge({ status }: { status: BookingItem["status"] }) {
  const styles: Record<BookingItem["status"], string> = {
    upcoming:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    completed:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    cancelled:
      "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full uppercase",
        styles[status]
      )}
    >
      {label}
    </span>
  );
}
