"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { api } from "@/convex/_generated/api";
import { Venue } from "@/components/booking/types";
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

const TIME_OPTIONS = Array.from(
  { length: 24 },
  (_, index) => `${index.toString().padStart(2, "0")}:00`
);

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

type BookedSlot = {
  booking_date: string;
  start_time: string;
  hours: number;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day);
};

const toMinutes = (time: string): number => {
  const [hoursStr, minutesStr] = time.split(":");
  return Number(hoursStr) * 60 + Number(minutesStr);
};

const hasOverlap = (
  time: string,
  durationHours: number,
  slots: BookedSlot[]
): boolean => {
  const startMinutes = toMinutes(time);
  const endMinutes = startMinutes + durationHours * 60;

  return slots.some((slot) => {
    const slotStart = toMinutes(slot.start_time);
    const slotEnd = slotStart + slot.hours * 60;
    return startMinutes < slotEnd && endMinutes > slotStart;
  });
};

export function VenueCard({
  venue,
  layout,
}: {
  venue: Venue;
  layout: "grid" | "list";
}) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>(TIME_OPTIONS[9]);
  const [hours, setHours] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const bookVenue = useMutation(api.venues.bookVenue);
  const deleteVenueMutation = useMutation(api.venues.deleteVenue);
  const bookedSlots = useQuery(api.venues.getBookedSlotsForVenue, {
    venue_id: venue._id,
  });
  const recentFeedback = useQuery(api.feedback.getRecentFeedbackForVenue, {
    venue_id: venue._id,
    limit: 5,
  });
  const currentUserRole = useQuery(api.users.getCurrentUserRole);
  const isAdmin = currentUserRole?.role === "admin";
  const averageRating = venue.averageRating ?? 0;
  const hasAverageRating = (venue.averageRating ?? 0) > 0;

  // Derive display fields for server data
  const displayName = venue.venue_name;
  const displayImage = venue.imageUrl ?? "/window.svg";

  const startOfToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const upcomingDates = useMemo(() => {
    return Array.from({ length: 60 }, (_, offset) => {
      const date = new Date(startOfToday);
      date.setDate(startOfToday.getDate() + offset);
      return date;
    });
  }, [startOfToday]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, BookedSlot[]>();
    (bookedSlots ?? []).forEach((slot) => {
      const list = map.get(slot.booking_date) ?? [];
      list.push(slot);
      map.set(slot.booking_date, list);
    });
    return map;
  }, [bookedSlots]);

  const fullyBookedIsoDates = useMemo(() => {
    const filled: string[] = [];
    slotsByDate.forEach((slots, isoDate) => {
      const hasAvailability = TIME_OPTIONS.some(
        (time) => !hasOverlap(time, 1, slots)
      );
      if (!hasAvailability) {
        filled.push(isoDate);
      }
    });
    return filled;
  }, [slotsByDate]);

  const fullyBookedDateSet = useMemo(
    () => new Set<string>(fullyBookedIsoDates),
    [fullyBookedIsoDates]
  );

  const fullyBookedDates = useMemo(
    () => fullyBookedIsoDates.map((iso) => parseDate(iso)),
    [fullyBookedIsoDates]
  );

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (date < startOfToday) {
        return true;
      }
      return fullyBookedDateSet.has(formatDate(date));
    },
    [startOfToday, fullyBookedDateSet]
  );

  useEffect(() => {
    if (selectedDate && !isDateDisabled(selectedDate)) {
      return;
    }
    const fallback = upcomingDates.find((date) => !isDateDisabled(date));
    if (
      fallback &&
      (!selectedDate || fallback.getTime() !== selectedDate.getTime())
    ) {
      setSelectedDate(fallback);
    }
  }, [isDateDisabled, selectedDate, upcomingDates]);

  const bookingDate = selectedDate ? formatDate(selectedDate) : "";

  const slotsForSelectedDate = useMemo(() => {
    if (!bookingDate) {
      return [] as BookedSlot[];
    }
    return slotsByDate.get(bookingDate) ?? [];
  }, [slotsByDate, bookingDate]);

  const availableHours = useMemo(() => {
    return HOUR_OPTIONS.filter((option) =>
      TIME_OPTIONS.some(
        (time) => !hasOverlap(time, option, slotsForSelectedDate)
      )
    );
  }, [slotsForSelectedDate]);

  useEffect(() => {
    if (!availableHours.length) {
      return;
    }
    if (!availableHours.includes(hours)) {
      setHours(availableHours[0]);
    }
  }, [availableHours, hours]);

  const disabledTimes = useMemo(() => {
    const disabled = new Set<string>();
    if (!slotsForSelectedDate.length) {
      return disabled;
    }
    TIME_OPTIONS.forEach((time) => {
      if (hasOverlap(time, hours, slotsForSelectedDate)) {
        disabled.add(time);
      }
    });
    return disabled;
  }, [slotsForSelectedDate, hours]);

  const hasAvailableTime = useMemo(() => {
    return TIME_OPTIONS.some(
      (time) => !hasOverlap(time, hours, slotsForSelectedDate)
    );
  }, [slotsForSelectedDate, hours]);

  useEffect(() => {
    if (!hasAvailableTime) {
      setStartTime("");
      return;
    }
    if (!startTime || disabledTimes.has(startTime)) {
      const fallback = TIME_OPTIONS.find((time) => !disabledTimes.has(time));
      if (fallback && fallback !== startTime) {
        setStartTime(fallback);
      }
    }
  }, [disabledTimes, hasAvailableTime, startTime]);

  const disabledDays = useMemo(
    () => [{ before: startOfToday }, ...fullyBookedDates],
    [startOfToday, fullyBookedDates]
  );

  const submitBooking = async () => {
    setIsBooking(true);
    try {
      if (!bookingDate || !startTime || !hasAvailableTime) {
        toast.error("Please select an available time slot.");
        return;
      }

      await bookVenue({
        venue_id: venue._id,
        booking_date: bookingDate,
        start_time: startTime,
        hours,
      });
      toast.success("Booking confirmed.");
      setOpen(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed.";
      if (message.toLowerCase().includes("already booked")) {
        toast.error("This venue is already booked for the selected time slot.");
      } else {
        toast.error("This didn't work.");
      }
    } finally {
      setIsBooking(false);
    }
  };

  const handleDeleteVenue = async () => {
    setIsDeleting(true);
    try {
      await deleteVenueMutation({
        venue_id: venue._id,
      });
      toast.success("Venue deleted.");
      setDetailsOpen(false);
      setOpen(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Deletion failed.";
      if (message.toLowerCase().includes("not authorized")) {
        toast.error("You do not have permission to delete this venue.");
      } else if (message.toLowerCase().includes("not authenticated")) {
        toast.error("Please sign in as an admin to delete this venue.");
      } else {
        toast.error("Unable to delete this venue.");
      }
    } finally {
      setIsDeleting(false);
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
        <img
          src={displayImage}
          alt={displayName}
          className="h-48 w-full object-cover md:h-56 transition-transform duration-500 group-hover:scale-[1.06]"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-black/55 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
          {venue.type}
        </div>
      </div>
      <div className="p-5 flex flex-col">
        <h3 className="font-semibold text-lg tracking-tight flex items-center gap-2">
          {displayName}
        </h3>
        <div className="mt-1">
          {hasAverageRating ? (
            <StarRating rating={averageRating} />
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              No ratings yet
            </span>
          )}
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
              <div className="space-y-5 py-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Date</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date || isDateDisabled(date)) {
                        return;
                      }
                      setSelectedDate(date);
                    }}
                    disabled={disabledDays}
                    modifiers={{ fullyBooked: fullyBookedDates }}
                    modifiersClassNames={{
                      fullyBooked:
                        "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-300",
                    }}
                    className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                    initialFocus
                  />
                </div>
                <div className="grid gap-3">
                  <label className="text-sm font-medium">Start Time</label>
                  <Select
                    value={startTime || undefined}
                    onValueChange={(value) => setStartTime(value)}
                    disabled={!hasAvailableTime}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          hasAvailableTime
                            ? "Select a start time"
                            : "No start times available"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem
                          key={time}
                          value={time}
                          disabled={disabledTimes.has(time)}
                        >
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <label className="text-sm font-medium">Hours</label>
                  <Select
                    value={String(hours)}
                    onValueChange={(value) => setHours(Number(value))}
                    disabled={!availableHours.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUR_OPTIONS.map((option) => (
                        <SelectItem
                          key={option}
                          value={String(option)}
                          disabled={!availableHours.includes(option)}
                        >
                          {option} {option === 1 ? "hour" : "hours"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Fully booked days are tinted and cannot be selected.
                </p>
                {!hasAvailableTime && (
                  <p className="text-xs font-medium text-red-500">
                    No available time slots for this date. Please try another
                    day.
                  </p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isBooking}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={submitBooking}
                  disabled={
                    isBooking || !bookingDate || !startTime || !hasAvailableTime
                  }
                >
                  {isBooking ? "Booking..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-full px-5">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{displayName}</DialogTitle>
                <DialogDescription>
                  Review venue details, book, or manage the listing.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={displayImage}
                    alt={displayName}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center justify-between text-base font-medium text-neutral-900 dark:text-neutral-100">
                    <span>{venue.location}</span>
                    {hasAverageRating ? (
                      <StarRating rating={averageRating} />
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        No ratings yet
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed text-neutral-700 dark:text-neutral-200">
                    {venue.venue_description}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
                      <span className="block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Venue Type
                      </span>
                      {venue.type}
                    </div>
                    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
                      <span className="block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Capacity
                      </span>
                      {venue.capacity} guests
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Recent Feedback
                    </h4>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {recentFeedback === undefined
                        ? "Loading"
                        : `Last ${recentFeedback.length}/5`}
                    </span>
                  </div>
                  {recentFeedback === undefined ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Loading feedback...
                    </p>
                  ) : recentFeedback.length === 0 ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      No feedback yet for this venue.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {recentFeedback.map((feedback) => (
                        <li
                          key={feedback._id}
                          className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                              {feedback.userName}
                            </span>
                            <StarRating rating={feedback.rating} />
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 line-clamp-4">
                            {feedback.comment}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <DialogFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDetailsOpen(false);
                      setOpen(true);
                    }}
                  >
                    Book Now
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteVenue}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Venue"}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
