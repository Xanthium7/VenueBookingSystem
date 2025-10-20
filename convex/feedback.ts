import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const getAuthenticatedUser = async (ctx: MutationCtx | QueryCtx) => {
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

  return user;
};

export const submitFeedback = mutation({
  args: {
    venue_id: v.id("venues"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("feedback", {
      user_id: user._id,
      venue_id: args.venue_id,
      rating: args.rating,
      comment: args.comment,
    });
  },
});

export const deleteFeedback = mutation({
  args: {
    feedback_id: v.id("feedback"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const feedback = await ctx.db.get(args.feedback_id);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    if (feedback.user_id !== user._id) {
      throw new Error("Not authorized to delete this feedback");
    }

    await ctx.db.delete(args.feedback_id);
    return args.feedback_id;
  },
});

export const updateFeedback = mutation({
  args: {
    feedback_id: v.id("feedback"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const feedback = await ctx.db.get(args.feedback_id);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    if (feedback.user_id !== user._id) {
      throw new Error("Not authorized to update this feedback");
    }

    await ctx.db.patch(args.feedback_id, {
      rating: args.rating,
      comment: args.comment,
    });

    return args.feedback_id;
  },
});

export const getFeedbackForUser = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();
  },
});

export const getRecentFeedbackForVenue = query({
  args: {
    venue_id: v.id("venues"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 5, 10));

    const feedbackEntries = await ctx.db
      .query("feedback")
      .withIndex("by_venue", (q) => q.eq("venue_id", args.venue_id))
      .order("desc")
      .take(limit);

    return Promise.all(
      feedbackEntries.map(async (entry) => {
        const user = await ctx.db.get(entry.user_id);
        return {
          _id: entry._id,
          rating: entry.rating,
          comment: entry.comment,
          userId: entry.user_id,
          userName: user?.name ?? "Anonymous",
          createdAt: entry._creationTime,
        };
      })
    );
  },
});
