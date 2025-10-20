import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  venues: defineTable({
    venue_name: v.string(),
    venue_image: v.optional(v.id("_storage")),
    venue_description: v.string(),
    location: v.string(),
    capacity: v.number(),
    type: v.string(),
  }),
  bookings: defineTable({
    user_id: v.id("users"),
    venue_id: v.id("venues"),
    booking_date: v.string(),
    start_time: v.string(),
    hours: v.number(),
  }).index("by_user", ["user_id"]),
  feedback: defineTable({
    user_id: v.id("users"),
    venue_id: v.id("venues"),
    rating: v.number(),
    comment: v.string(),
  }),
  notices: defineTable({
    user_id: v.id("users"),
    title: v.string(),
    message: v.string(),
  }).index("by_user", ["user_id"]),
});
