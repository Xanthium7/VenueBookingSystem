import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getVenues = query({
  handler: async (ctx) => {
    const venues = await ctx.db.query("venues").collect();
    return Promise.all(
      venues.map(async (venue) => ({
        ...venue,
        ...(venue.venue_image
          ? { imageUrl: await ctx.storage.getUrl(venue.venue_image) }
          : {}),
      }))
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

export const bookVenue = mutation({
  args: {
    // user_id: v.id("user"),
    venue_id: v.id("venues"),
    booking_date: v.string(),
    start_time: v.string(),
    hours: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
      // return null
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    ).unique();
    if (!user) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("bookings", {
      user_id: user?._id,
      venue_id: args.venue_id,
      booking_date: args.booking_date,
      start_time: args.start_time,
      hours: args.hours,
    });
  }
})

export const getBookingsForUser = query({
  
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    ).unique();
    if (!user) {
      throw new Error("User not found");
    }

    const bookings = await ctx.db.query("bookings").withIndex("by_user", (q) =>
      q.eq("user_id", user?._id)
    ).collect();

    return bookings;
  }
})