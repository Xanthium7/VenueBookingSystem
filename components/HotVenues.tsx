"use client";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import type { Venue } from "@/components/booking/types";
import { VenueBookingDialog } from "@/components/VenueBookingDialog";

export function HotVenues({ venues }: { venues?: Venue[] }) {
  const list = venues ?? [];
  const hot = [...list].slice(0, 4);

  return (
    <section className="relative -mt-10 md:-mt-16 z-10">
      <div className="mx-auto max-w-7xl px-5">
        <div className="bg-white/85 backdrop-blur-2xl border border-white/30  ring-1 ring-black/5 rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Hot Venues
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-xl">
                Trending spaces loved by organizers this week.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-white/60 dark:bg-neutral-800/50 backdrop-blur"
              >
                View All
              </Button>
            </div>
          </div>
          <div
            className="flex gap-6 justify-around overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
            role="list"
          >
            {hot.map((v) => (
              <div
                key={v._id}
                role="listitem"
                className="min-w-[260px] md:min-w-[300px] group rounded-2xl overflow-hidden bg-white/60 dark:bg-neutral-900/50 border border-white/30 dark:border-white/10 backdrop-blur-xl shadow hover:shadow-xl transition-all"
              >
                <div className="relative">
                  <img
                    src={v.imageUrl ?? "/window.svg"}
                    alt={v.venue_name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full bg-white/80 backdrop-blur text-neutral-900 dark:bg-neutral-800/70 dark:text-neutral-100">
                    {v.type}
                  </div>
                </div>
                <div className="p-4 flex flex-col">
                  <h3 className="font-semibold tracking-tight text-base">
                    {v.venue_name}
                  </h3>
                  <div className="mt-1">
                    {v.averageRating && v.averageRating > 0 ? (
                      <StarRating rating={v.averageRating} size={14} />
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        No ratings yet
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {v.location}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm font-medium">
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {v.type}
                    </span>
                    <VenueBookingDialog
                      venue={v}
                      trigger={
                        <Button size="sm" className="rounded-full px-4 h-8">
                          Book
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
