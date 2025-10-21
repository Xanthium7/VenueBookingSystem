"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "react-hot-toast";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const formatDateTime = (timestamp: number) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
};

export function NotificationFooter() {
  const notices = useQuery(api.notices.getLatestNotices, { limit: 3 });
  const currentUserRole = useQuery(api.users.getCurrentUserRole);
  const addNotice = useMutation(api.notices.addNotice);
  const updateNotice = useMutation(api.notices.updateNotice);
  const deleteNotice = useMutation(api.notices.deleteNotice);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<Id<"notices"> | null>(null);

  const latest = notices?.[0] ?? null;
  const isAdmin = currentUserRole?.role === "admin";
  type Notice = NonNullable<typeof notices>[number];

  const bannerMessage = useMemo(() => {
    if (latest) {
      return `${latest.title}: ${latest.message}`;
    }
    if (notices === undefined) {
      return "Loading notices...";
    }
    return isAdmin
      ? "No notices yet. Create the first announcement."
      : "No announcements yet.";
  }, [latest, notices, isAdmin]);

  const hasContent = Boolean(latest) || isAdmin;

  if (!hasContent) {
    return null;
  }

  const beginEdit = (notice: Notice) => {
    setEditingId(notice._id);
    setTitle(notice.title);
    setMessage(notice.message);
    if (!open) {
      setOpen(true);
    }
  };

  const handleDelete = async (noticeId: Id<"notices">) => {
    try {
      await deleteNotice({ notice_id: noticeId });
      toast.success("Notice deleted.");
      if (editingId === noticeId) {
        setEditingId(null);
        setTitle("");
        setMessage("");
      }
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Failed to delete notice.";
      toast.error(messageText);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <div className="pointer-events-auto mx-auto max-w-5xl">
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/25 bg-neutral-900/90 px-5 py-3 text-white shadow-xl backdrop-blur">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-white/60">
                Latest Announcement
              </p>
              <p className="truncate text-sm font-medium text-white/90">
                {bannerMessage}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-neutral-900"
                >
                  View
                </Button>
              </DialogTrigger>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                  className="border-white/50 text-black hover:bg-white/80"
                >
                  Manage
                </Button>
              )}
            </div>
          </div>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Recent Notices</DialogTitle>
              <DialogDescription>
                Stay up to date with the latest announcements. Only admins can
                create new notices.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {notices === undefined ? (
                <p className="text-sm text-neutral-500">Loading notices...</p>
              ) : notices.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  There are no notices yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {notices.map((notice) => (
                    <li
                      key={notice._id}
                      className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {notice.title}
                          </p>
                          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                            {notice.message}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                            {formatDateTime(notice._creationTime)}
                          </span>
                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-neutral-500 hover:text-neutral-700"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={() => beginEdit(notice)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDelete(notice._id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        Posted by {notice.authorName}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isAdmin && (
              <div className="mt-6 space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Create a new notice
                </h3>
                {editingId && (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Editing existing notice. Saving will update the post.
                  </p>
                )}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="notice-title">Title</Label>
                    <Input
                      id="notice-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Announcement title"
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notice-message">Message</Label>
                    <Textarea
                      id="notice-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Share key details or updates..."
                      className="min-h-24"
                      maxLength={280}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTitle("");
                        setMessage("");
                        setEditingId(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={async () => {
                        if (!title.trim() || !message.trim()) {
                          toast.error("Both title and message are required.");
                          return;
                        }

                        setIsSubmitting(true);
                        try {
                          if (editingId) {
                            await updateNotice({
                              notice_id: editingId,
                              title: title.trim(),
                              message: message.trim(),
                            });
                            toast.success("Notice updated.");
                          } else {
                            await addNotice({
                              title: title.trim(),
                              message: message.trim(),
                            });
                            toast.success("Notice published.");
                          }
                          setTitle("");
                          setMessage("");
                          setEditingId(null);
                        } catch (error) {
                          const messageText =
                            error instanceof Error
                              ? error.message
                              : "Unable to save notice.";
                          toast.error(messageText);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                    >
                      {isSubmitting
                        ? editingId
                          ? "Saving..."
                          : "Publishing..."
                        : editingId
                          ? "Save changes"
                          : "Publish"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
