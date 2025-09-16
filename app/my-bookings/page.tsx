"use client";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// Removed next/image import for this card to simplify and use plain <img>.

interface BookingItem {
  id: string;
  venueName: string;
  venueImage: string; // always a usable src (fallback applied)
  date: string;
  startTime: string;
  hours: number;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
}

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

function BookingCard({
  booking,
  layout,
}: {
  booking: BookingItem;
  layout: "grid" | "list";
}) {
  const start = `${booking.date} ${booking.startTime}`;

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

function StatusBadge({ status }: { status: BookingItem["status"] }) {
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

function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-200"
    >
      <option value="all">All Statuses</option>
      <option value="upcoming">Upcoming</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}

function ToggleBtn({
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

function SkeletonList({ view }: { view: "list" | "grid" }) {
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

function EmptyState() {
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
