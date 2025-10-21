"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { api } from "@/convex/_generated/api";
import { Venue } from "@/components/booking/types";
import { VenueBookingDialog } from "@/components/VenueBookingDialog";
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

export function VenueCard({
  venue,
  layout,
}: {
  venue: Venue;
  layout: "grid" | "list";
}) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteVenueMutation = useMutation(api.venues.deleteVenue);
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
          <VenueBookingDialog
            venue={venue}
            open={open}
            onOpenChange={setOpen}
            trigger={
              <Button size="sm" className="rounded-full px-5">
                Book
              </Button>
            }
          />
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
