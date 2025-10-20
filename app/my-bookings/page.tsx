"use client";
import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookingItem, BookingFeedback } from "@/components/booking/types";
import { StatusSelect } from "@/components/booking/StatusSelect";
import { ToggleBtn } from "@/components/booking/ToggleBtn";
import { SkeletonList } from "@/components/booking/SkeletonList";
import { EmptyState } from "@/components/booking/EmptyState";
import { BookingCard } from "@/components/booking/BookingCard";

// BookingItem type moved to components/booking/types.ts

type UserFeedbackRecord = {
  _id: BookingFeedback["id"];
  venue_id: BookingItem["venueId"];
  rating: number;
  comment: string;
};

export default function MyBookingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [view, setView] = useState<"list" | "grid">("grid");
  // Queries (undefined while loading)
  const bookings = useQuery(api.venues.getBookingsForUser);
  const venues = useQuery(api.venues.getVenues);
  const feedbacks = useQuery(api.feedback.getFeedbackForUser);
  const deleteBookingMutation = useMutation(api.venues.deleteBooking);
  const submitFeedbackMutation = useMutation(api.feedback.submitFeedback);
  const updateFeedbackMutation = useMutation(api.feedback.updateFeedback);
  const isLoading =
    bookings === undefined || venues === undefined || feedbacks === undefined;

  // Build a quick lookup for venues
  const venueMap = useMemo(() => {
    const m = new Map<string, any>();
    (venues ?? []).forEach((v: any) => m.set(v._id, v));
    return m;
  }, [venues]);

  const feedbackMap = useMemo(() => {
    const m = new Map<BookingItem["venueId"], UserFeedbackRecord>();
    (feedbacks ?? []).forEach((f) => {
      const record = f as UserFeedbackRecord;
      m.set(record.venue_id, record);
    });
    return m;
  }, [feedbacks]);

  // Transform raw bookings into BookingItem objects
  const derived: BookingItem[] = useMemo(() => {
    if (!bookings) return [];
    const now = Date.now();

    const enriched = bookings.map((b: any) => {
      const venue = venueMap.get(b.venue_id);
      const startTs = Date.parse(`${b.booking_date}T${b.start_time}:00`);
      const endTs = startTs + b.hours * 60 * 60 * 1000;
      let statusLabel: BookingItem["status"] = "upcoming";
      if (now > endTs) statusLabel = "completed";

      const feedback = feedbackMap.get(b.venue_id);

      const base: BookingItem = {
        id: b._id,
        venueId: b.venue_id,
        venueName: venue?.venue_name ?? "Unknown Venue",
        venueImage: venue?.imageUrl ?? "/window.svg",
        date: b.booking_date,
        startTime: b.start_time,
        hours: b.hours,
        status: statusLabel,
        location: venue?.location ?? "-",
        feedback: feedback
          ? {
              id: feedback._id,
              rating: feedback.rating,
              comment: feedback.comment,
            }
          : undefined,
      };

      return { booking: base, startTimestamp: startTs };
    });

    enriched.sort((a, b) => b.startTimestamp - a.startTimestamp);

    return enriched.map((entry) => entry.booking);
  }, [bookings, venueMap, feedbackMap]);

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

  const handleDelete = useCallback(
    async (bookingId: BookingItem["id"]) => {
      try {
        await deleteBookingMutation({ booking_id: bookingId });
      } catch (error) {
        console.error("Failed to delete booking", error);
      }
    },
    [deleteBookingMutation]
  );

  const handleSubmitFeedback = useCallback(
    async ({
      bookingId: _bookingId,
      venueId,
      rating,
      comment,
    }: {
      bookingId: BookingItem["id"];
      venueId: BookingItem["venueId"];
      rating: number;
      comment: string;
    }) => {
      try {
        await submitFeedbackMutation({
          venue_id: venueId,
          rating,
          comment,
        });
      } catch (error) {
        console.error("Failed to submit feedback", error);
        throw error;
      }
    },
    [submitFeedbackMutation]
  );

  const handleUpdateFeedback = useCallback(
    async ({
      feedbackId,
      rating,
      comment,
    }: {
      feedbackId: BookingFeedback["id"];
      rating: number;
      comment: string;
    }) => {
      try {
        await updateFeedbackMutation({
          feedback_id: feedbackId,
          rating,
          comment,
        });
      } catch (error) {
        console.error("Failed to update feedback", error);
        throw error;
      }
    },
    [updateFeedbackMutation]
  );

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
            <BookingCard
              key={b.id}
              booking={b}
              layout={view}
              onDelete={handleDelete}
              onSubmitFeedback={handleSubmitFeedback}
              onUpdateFeedback={handleUpdateFeedback}
            />
          ))}
        </div>
      )}
    </main>
  );
}
