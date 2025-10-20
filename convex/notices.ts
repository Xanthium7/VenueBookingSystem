import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const getAuthenticatedUser = async (ctx: QueryCtx | MutationCtx) => {
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

export const getNotices = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db
      .query("notices")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();
  },
});

export const addNotice = mutation({
  args: {
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("notices", {
      user_id: user._id,
      title: args.title,
      message: args.message,
    });
  },
});

export const deleteNotice = mutation({
  args: {
    notice_id: v.id("notices"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const notice = await ctx.db.get(args.notice_id);
    if (!notice) {
      throw new Error("Notice not found");
    }

    if (notice.user_id !== user._id) {
      throw new Error("Not authorized to delete this notice");
    }

    await ctx.db.delete(args.notice_id);
    return args.notice_id;
  },
});
