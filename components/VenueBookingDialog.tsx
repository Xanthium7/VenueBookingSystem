"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "react-hot-toast";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Venue } from "@/components/booking/types";

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

type VenueBookingDialogProps = {
  venue: Venue;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function VenueBookingDialog({
  venue,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: VenueBookingDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>(TIME_OPTIONS[9]);
  const [hours, setHours] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);

  const bookVenue = useMutation(api.venues.bookVenue);
  const bookedSlots = useQuery(api.venues.getBookedSlotsForVenue, {
    venue_id: venue._id,
  });

  useEffect(() => {
    if (!open) {
      setSelectedDate(undefined);
      setStartTime(TIME_OPTIONS[9]);
      setHours(1);
    }
  }, [open]);

  const displayName = venue.venue_name;

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="rounded-full px-5">
            Book
          </Button>
        )}
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
              className="mx-auto rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
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
              No available time slots for this date. Please try another day.
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
  );
}
