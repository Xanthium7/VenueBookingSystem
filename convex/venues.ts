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
  },
  handler: async (ctx, args) => {
    const insertedId = await ctx.db.insert("venues", {
      venue_name: args.venue_name,
      venue_image: args.storageId ?? undefined,
      location: args.location,
      capacity: args.capacity,
      type: args.type,
    });

    return insertedId;
  },
});
