import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        name: v.string(),
    }),
    venues: defineTable({
        venue_name: v.string(),
        location: v.string(),
        capacity: v.number(),
        type: v.string(),
    }),
    bookings: defineTable({
        user_id: v.id("user"),
        venue_id: v.id("venues"),
        booking_date: v.string(),
        start_time: v.string(),
        hours: v.number(),
    }),
    feedback: defineTable({
        user_id: v.id("user"),
        venue_id: v.id("venues"),
        rating: v.number(),
        comment: v.string(),
    }),
    notices: defineTable({
        user_id: v.id("user"),
        title: v.string(),
        message: v.string(),
    })
})