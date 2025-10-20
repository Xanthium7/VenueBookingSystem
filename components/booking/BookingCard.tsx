"use client";
import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { BookingFeedback } from "./types";
import { BookingItem } from "./types";

export function BookingCard({
  booking,
  layout,
  onDelete,
  onSubmitFeedback,
  onUpdateFeedback,
}: {
  booking: BookingItem;
  layout: "grid" | "list";
  onDelete?: (id: BookingItem["id"]) => void;
  onSubmitFeedback?: (payload: {
    bookingId: BookingItem["id"];
    venueId: BookingItem["venueId"];
    rating: number;
    comment: string;
  }) => Promise<void> | void;
  onUpdateFeedback?: (payload: {
    feedbackId: BookingFeedback["id"];
    rating: number;
    comment: string;
  }) => Promise<void> | void;
}) {
  const isCompleted = booking.status === "completed";
  const existingFeedback = booking.feedback;
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFeedbackSubmit = async () => {
    const isEditing = Boolean(existingFeedback);

    const numericRating = Number(rating);
    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      setErrorMessage("Please enter a rating between 1 and 5.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Please share a quick comment about your experience.");
      return;
    }

    const sanitizedComment = comment.trim();

    try {
      setSubmitting(true);
      setErrorMessage(null);
      if (isEditing && existingFeedback) {
        if (!onUpdateFeedback) {
          setFeedbackOpen(false);
          setSubmitting(false);
          return;
        }
        await onUpdateFeedback({
          feedbackId: existingFeedback.id,
          rating: numericRating,
          comment: sanitizedComment,
        });
      } else {
        if (!onSubmitFeedback) {
          setFeedbackOpen(false);
          setSubmitting(false);
          return;
        }
        await onSubmitFeedback({
          bookingId: booking.id,
          venueId: booking.venueId,
          rating: numericRating,
          comment: sanitizedComment,
        });
      }

      setFeedbackOpen(false);
      setComment(sanitizedComment);
      setRating(String(numericRating));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to submit feedback.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
              className={cn(
                "rounded-full px-4 py-4",
                isCompleted
                  ? "bg-neutral-200 text-black border border-neutral-300 hover:bg-black hover:text-white"
                  : "bg-red-600/80"
              )}
              variant={isCompleted ? "secondary" : "destructive"}
              onClick={() => {
                if (isCompleted) {
                  setRating(String(existingFeedback?.rating ?? 5));
                  setComment(existingFeedback?.comment ?? "");
                  setErrorMessage(null);
                  setFeedbackOpen(true);
                } else {
                  onDelete?.(booking.id);
                }
              }}
            >
              {isCompleted
                ? existingFeedback
                  ? "Edit Feedback"
                  : "Submit Feedback"
                : "Cancel Booking"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isFeedbackOpen}
        onOpenChange={(open) => {
          setFeedbackOpen(open);
          if (!open) {
            setSubmitting(false);
            setErrorMessage(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor={`rating-${booking.id}`}>Rating (1-5)</Label>
              <Input
                id={`rating-${booking.id}`}
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setRating(event.target.value)
                }
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`comment-${booking.id}`}>Comments</Label>
              <Textarea
                id={`comment-${booking.id}`}
                value={comment}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setComment(event.target.value)
                }
                placeholder="Tell us about the venue, amenities, or support."
                disabled={submitting}
                required
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFeedbackOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
