"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Venue } from "@/components/booking/types";
import { VenueCard } from "./VenueCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function VenueExplorer() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const params = useSearchParams();
  const searchQuery = params?.get("query")?.toLowerCase().trim() ?? "";

  const serverVenues = useQuery(api.venues.getVenues);
  const data: Venue[] = (serverVenues ?? []) as Venue[];

  const filteredVenues = useMemo(() => {
    if (!searchQuery) {
      return data;
    }
    return data.filter((venue) => {
      const haystacks = [
        venue.venue_name,
        venue.location,
        venue.type,
        venue.venue_description,
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(searchQuery));
    });
  }, [data, searchQuery]);

  return (
    <section id="venues" className="mx-auto max-w-7xl px-5 py-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Available Venues
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-xl">
            Hand-picked spaces ready for your next meeting, workshop, or
            celebration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleButton
            active={view === "grid"}
            onClick={() => setView("grid")}
          >
            Grid
          </ToggleButton>
          <ToggleButton
            active={view === "list"}
            onClick={() => setView("list")}
          >
            List
          </ToggleButton>
        </div>
      </div>
      <div
        className={cn(
          "transition-all",
          view === "grid"
            ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-6"
        )}
      >
        {filteredVenues.map((v) => (
          <VenueCard key={v._id} venue={v} layout={view} />
        ))}
        {!filteredVenues.length && (
          <p className="col-span-full text-center text-sm text-neutral-500 dark:text-neutral-400">
            No venues match “{searchQuery}”. Try a different keyword.
          </p>
        )}
      </div>
    </section>
  );
}

function ToggleButton({
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
        "text-sm px-4 h-9 rounded-full border font-medium transition-colors",
        active
          ? "bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 border-neutral-900 dark:border-neutral-50"
          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
      )}
    >
      {children}
    </button>
  );
}
