import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const timeToMinutes = (time: string): number => {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time format. Expected HH:MM in 24-hour format.");
  }
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
  const normalized = Math.max(0, totalMinutes);
  const hours = Math.floor(normalized / 60) % 24;
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getVenues = query({
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    return Promise.all(
      venues.map(async (venue) => {
        const feedbackEntries = await ctx.db
          .query("feedback")
          .withIndex("by_venue", (q) => q.eq("venue_id", venue._id))
          .collect();

        const ratingSum = feedbackEntries.reduce(
          (sum, feedback) => sum + feedback.rating,
          0
        );
        const averageRating =
          feedbackEntries.length > 0
            ? Number((ratingSum / feedbackEntries.length).toFixed(1))
            : null;

        return {
          ...venue,
          ...(venue.venue_image
            ? { imageUrl: await ctx.storage.getUrl(venue.venue_image) }
            : {}),
          averageRating,
        };
      })
    );
  },
});

export const addVenue = mutation({
  args: {
    venue_name: v.string(),
    type: v.string(),
    capacity: v.number(),
    location: v.string(),
    storageId: v.optional(v.id("_storage")),
    venue_description: v.string(),
  },
  handler: async (ctx, args) => {
    const insertedId = await ctx.db.insert("venues", {
      venue_name: args.venue_name,
      venue_image: args.storageId ?? undefined,
      location: args.location,
      capacity: args.capacity,
      type: args.type,
      venue_description: args.venue_description,
    });

    return insertedId;
  },
});

export const deleteVenue = mutation({
  args: {
    venue_id: v.id("venues"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized to delete venues");
    }

    const venue = await ctx.db.get(args.venue_id);
    if (!venue) {
      throw new Error("Venue not found");
    }

    if (venue.venue_image) {
      await ctx.storage.delete(venue.venue_image);
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_venue", (q) => q.eq("venue_id", args.venue_id))
      .collect();

    await Promise.all(bookings.map((booking) => ctx.db.delete(booking._id)));

    const feedbackEntries = await ctx.db
      .query("feedback")
      .withIndex("by_venue", (q) => q.eq("venue_id", args.venue_id))
      .collect();

    await Promise.all(
      feedbackEntries.map((feedback) => ctx.db.delete(feedback._id))
    );

    await ctx.db.delete(args.venue_id);
    return args.venue_id;
  },
});

export const bookVenue = mutation({
  args: {
    venue_id: v.id("venues"),
    booking_date: v.string(),
    start_time: v.string(),
    hours: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const requestedStart = timeToMinutes(args.start_time);
    const requestedEnd = requestedStart + args.hours * 60;

    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_venue", (q) => q.eq("venue_id", args.venue_id))
      .collect();

    const hasOverlap = existingBookings.some((booking) => {
      if (booking.booking_date !== args.booking_date) {
        return false;
      }

      const existingStart = timeToMinutes(booking.start_time);
      const existingEnd = existingStart + booking.hours * 60;
      return requestedStart < existingEnd && requestedEnd > existingStart;
    });

    if (hasOverlap) {
      throw new Error(
        "This venue is already booked for the selected time slot."
      );
    }

    return await ctx.db.insert("bookings", {
      user_id: user._id,
      venue_id: args.venue_id,
      booking_date: args.booking_date,
      start_time: args.start_time,
      hours: args.hours,
    });
  },
});

export const getBookingsForUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();

    return bookings;
  },
});

export const getBookedSlotsForVenue = query({
  args: {
    venue_id: v.id("venues"),
    booking_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_venue", (q) => q.eq("venue_id", args.venue_id))
      .collect();

    const filtered = args.booking_date
      ? bookings.filter((booking) => booking.booking_date === args.booking_date)
      : bookings;

    return filtered.map((booking) => {
      const startMinutes = timeToMinutes(booking.start_time);
      const endMinutes = startMinutes + booking.hours * 60;

      return {
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: minutesToTime(endMinutes % (24 * 60)),
        hours: booking.hours,
      };
    });
  },
});

export const deleteBooking = mutation({
  args: {
    booking_id: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const booking = await ctx.db.get(args.booking_id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.user_id !== user._id) {
      throw new Error("Not authorized to delete this booking");
    }

    await ctx.db.delete(args.booking_id);
    return args.booking_id;
  },
});
