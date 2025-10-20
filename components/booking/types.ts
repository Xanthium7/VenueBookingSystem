import type { Id } from "@/convex/_generated/dataModel";

export interface BookingItem {
  id: Id<"bookings">;
  venueName: string;
  venueImage: string;
  date: string;
  startTime: string;
  hours: number;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
}

// Venue interface shared across components (originally in VenueCard.tsx)
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
