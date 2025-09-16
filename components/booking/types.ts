export interface BookingItem {
  id: string;
  venueName: string;
  venueImage: string;
  date: string;
  startTime: string;
  hours: number;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
}
