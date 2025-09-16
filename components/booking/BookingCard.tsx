"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { BookingItem } from "./types";

export function BookingCard({
  booking,
  layout,
}: {
  booking: BookingItem;
  layout: "grid" | "list";
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/30 dark:border-white/10 bg-white/55 dark:bg-neutral-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all",
        layout === "list" && "flex"
      )}
    >
      {layout === "list" && (
        <div className="relative hidden sm:block w-48 md:w-56 shrink-0 self-stretch bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <img
            src={booking.venueImage}
            alt={booking.venueName}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/10 via-transparent to-transparent" />
        </div>
      )}
      <div
        className={cn(
          "flex flex-col w-full",
          layout === "grid" ? "p-5" : "p-5"
        )}
      >
        {layout === "grid" && (
          <div className="relative mb-4 overflow-hidden rounded-md h-40">
            <img
              src={booking.venueImage}
              alt={booking.venueName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold tracking-tight text-lg leading-snug">
              {booking.venueName}
            </h3>
            <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
              {booking.location}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-4 grid gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center justify-between">
            <span className="font-medium">Date</span>
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Start Time</span>
            <span>{booking.startTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Duration</span>
            <span>
              {booking.hours} hr{booking.hours > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          {booking.status === "upcoming" && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => alert("Cancel booking (wire backend)")}
            >
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-full"
            variant="secondary"
            onClick={() => alert("View details (wire backend)")}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
