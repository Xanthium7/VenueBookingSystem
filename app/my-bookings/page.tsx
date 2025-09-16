"use client";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookingItem } from "@/components/booking/types";
import { StatusSelect } from "@/components/booking/StatusSelect";
import { ToggleBtn } from "@/components/booking/ToggleBtn";
import { SkeletonList } from "@/components/booking/SkeletonList";
import { EmptyState } from "@/components/booking/EmptyState";
import { BookingCard } from "@/components/booking/BookingCard";

// BookingItem type moved to components/booking/types.ts

export default function MyBookingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  // Queries (undefined while loading)
  const bookings = useQuery(api.venues.getBookingsForUser);
  const venues = useQuery(api.venues.getVenues);
  const isLoading = bookings === undefined || venues === undefined;

  // Build a quick lookup for venues
  const venueMap = useMemo(() => {
    const m = new Map<string, any>();
    (venues ?? []).forEach((v: any) => m.set(v._id, v));
    return m;
  }, [venues]);

  // Transform raw bookings into BookingItem objects
  const derived: BookingItem[] = useMemo(() => {
    if (!bookings) return [];
    const now = Date.now();
    return bookings.map((b: any) => {
      const venue = venueMap.get(b.venue_id);
      const startTs = Date.parse(`${b.booking_date}T${b.start_time}:00`);
      const endTs = startTs + b.hours * 60 * 60 * 1000;
      let statusLabel: BookingItem["status"] = "upcoming";
      if (now > endTs) statusLabel = "completed";
      return {
        id: b._id,
        venueName: venue?.venue_name ?? "Unknown Venue",
        venueImage: venue?.imageUrl ?? "/window.svg",
        date: b.booking_date,
        startTime: b.start_time,
        hours: b.hours,
        status: statusLabel,
        location: venue?.location ?? "-",
      } as BookingItem;
    });
  }, [bookings, venueMap]);

  // Apply filters
  const filtered = useMemo(() => {
    return derived.filter((b) => {
      const matchesQuery =
        !query ||
        b.venueName.toLowerCase().includes(query.toLowerCase()) ||
        b.location.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || b.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, derived]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <header className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">My Bookings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-sm">
          Review, manage, and track all your venue reservations. Upcoming
          bookings can be cancelled ahead of time; completed ones are archived
          for your records.
        </p>
      </header>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex flex-1 items-center gap-3">
          <Input
            placeholder="Search by venue or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10"
          />
          <StatusSelect value={status} onChange={setStatus} />
        </div>
        <div className="flex items-center gap-2">
          <ToggleBtn active={view === "list"} onClick={() => setView("list")}>
            List
          </ToggleBtn>
          <ToggleBtn active={view === "grid"} onClick={() => setView("grid")}>
            Grid
          </ToggleBtn>
        </div>
      </section>

      {isLoading ? (
        <SkeletonList view={view} />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className={cn(
            view === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          )}
        >
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} layout={view} />
          ))}
        </div>
      )}
    </main>
  );
}

