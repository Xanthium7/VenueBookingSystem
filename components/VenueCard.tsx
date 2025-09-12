"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import type { Id } from "@/convex/_generated/dataModel";

// Unified venue shape to support both server (Convex) data and legacy placeholder data
export interface Venue {
  _id: Id<"venues">;
  venue_name: string;
  venue_image?: Id<"_storage">;
  imageUrl?: string | null;
  location: string;
  type: string;
  capacity: number;
  _creationTime: number;
}

export function VenueCard({
  venue,
  layout,
}: {
  venue: Venue;
  layout: "grid" | "list";
}) {
  // Derive display fields for server data
  const displayName = venue.venue_name;
  const displayImage = venue.imageUrl ?? "/window.svg";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/30 dark:border-white/10 bg-white/55 dark:bg-neutral-900/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.18)] transition-shadow",
        layout === "list" && "flex gap-6"
      )}
    >
      <div
        className={cn(
          "relative",
          layout === "list" ? "w-72 shrink-0" : "w-full"
        )}
      >
        {" "}
        <img
          src={displayImage}
          alt={displayName}
          className="h-48 w-full object-cover md:h-56 transition-transform duration-500 group-hover:scale-[1.06]"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-black/55 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
          {venue.type}
        </div>
        <button className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-neutral-900 text-xs font-medium px-3 py-1.5 rounded-full shadow">
          View
        </button>
      </div>
      <div className="p-5 flex flex-col">
        <h3 className="font-semibold text-lg tracking-tight flex items-center gap-2">
          {displayName}
        </h3>
        <div className="mt-1">
          <StarRating rating={Number(4)} />
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {venue.location}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 line-clamp-3">
          A versatile venue suited for events, workshops, and collaborative
          sessions. Modern interior, flexible seating, and seamless ambiance for
          memorable experiences.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Capacity: {venue.capacity}
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300">{venue.type}</div>
        </div>
        <div className="mt-5 flex gap-3">
          <Button size="sm" className="rounded-full px-5">
            Book
          </Button>
          <Button size="sm" variant="outline" className="rounded-full px-5">
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
