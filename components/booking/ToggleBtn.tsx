"use client";
import { cn } from "@/lib/utils";
import React from "react";

export function ToggleBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs md:text-sm px-4 h-9 rounded-full border font-medium transition-colors",
        active
          ? "bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 border-neutral-900 dark:border-neutral-50"
          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
      )}
    >
      {children}
    </button>
  );
}
