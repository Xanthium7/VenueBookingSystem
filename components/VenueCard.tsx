"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Unified venue shape to support both server (Convex) data and legacy placeholder data
export interface Venue {
  _id: Id<"venues">;
  venue_name: string;
  venue_image?: Id<"_storage">;
  imageUrl?: string | null;
  venue_description: string;
  location: string;
  type: string;
  capacity: number;
  _creationTime: number;
}

// removed invalid top-level hook usage

export function VenueCard({
  venue,
  layout,
}: {
  venue: Venue;
  layout: "grid" | "list";
}) {
  const [open, setOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [startTime, setStartTime] = useState<string>("09:00");
  const [hours, setHours] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const bookVenue = useMutation(api.venues.bookVenue);

  // Derive display fields for server data
  const displayName = venue.venue_name;
  const displayImage = venue.imageUrl ?? "/window.svg";

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const submitBooking = async () => {
    setIsBooking(true);
    try {
      await bookVenue({
        venue_id: venue._id,
        booking_date: bookingDate,
        start_time: startTime,
        hours,
      });
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

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
          {venue.venue_description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Capacity: {venue.capacity}
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            {venue.type}
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full px-5">
                Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Book {displayName}</DialogTitle>
                <DialogDescription>
                  Select a future date, start time, and duration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={bookingDate}
                    min={todayStr}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Hours</label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Past dates are disabled. Add validation for availability later.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isBooking}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={submitBooking}
                  disabled={isBooking || bookingDate < todayStr}
                >
                  {isBooking ? "Booking..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" className="rounded-full px-5">
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
