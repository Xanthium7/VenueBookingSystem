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

export const getLatestNotices = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 3, 10));

    const notices = await ctx.db.query("notices").order("desc").take(limit);

    return Promise.all(
      notices.map(async (notice) => {
        const author = await ctx.db.get(notice.user_id);
        return {
          ...notice,
          authorName: author?.name ?? "Admin",
        };
      })
    );
  },
});

export const addNotice = mutation({
  args: {
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if ((user.role ?? "user") !== "admin") {
      throw new Error("Not authorized to create notices");
    }

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

    if ((user.role ?? "user") !== "admin") {
      throw new Error("Not authorized to delete notices");
    }

    const notice = await ctx.db.get(args.notice_id);
    if (!notice) {
      throw new Error("Notice not found");
    }

    await ctx.db.delete(args.notice_id);
    return args.notice_id;
  },
});

export const updateNotice = mutation({
  args: {
    notice_id: v.id("notices"),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if ((user.role ?? "user") !== "admin") {
      throw new Error("Not authorized to update notices");
    }

    const notice = await ctx.db.get(args.notice_id);
    if (!notice) {
      throw new Error("Notice not found");
    }

    await ctx.db.patch(args.notice_id, {
      title: args.title,
      message: args.message,
    });

    return args.notice_id;
  },
});
