"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddVenue() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateUploadUrl = useMutation(api.venues.generateUploadUrl);
  const addVenueMutation = useMutation(api.venues.addVenue);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o: boolean) => {
        setOpen(o);
        if (!o) {
          if (preview) URL.revokeObjectURL(preview);
          setPreview(null);
          setSelectedFile(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="text-black/80 cursor-pointer">
          Add venue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={async (e: FormEvent) => {
            e.preventDefault();

            // collect form values
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const venue_name = String(formData.get("venue_name") || "");
            const type = String(formData.get("type") || "");
            const capacity = Number(formData.get("capacity") || 0);
            const location = String(formData.get("location") || "");

            if (!selectedFile) {
              return alert("Please select an image file.");
            }

            setIsSubmitting(true);
            try {
              const postUrl = await generateUploadUrl();
              const res = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": selectedFile.type },
                body: selectedFile,
              });
              if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
              const json = await res.json();
              const { storageId } = json;

              await addVenueMutation({
                venue_name,
                type,
                capacity,
                location,
                storageId,
              });

              // reset
              setSelectedFile(null);
              if (preview) {
                URL.revokeObjectURL(preview);
              }
              setPreview(null);
              form.reset();
              // close dialog on success
              setOpen(false);
            } catch (err) {
              console.error(err);
              alert("Failed to create venue. Please try again.");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add venue</DialogTitle>
            <DialogDescription>
              Fill out the venue details below and click Create when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="venue_name">Venue name</Label>
              <Input
                id="venue_name"
                name="venue_name"
                defaultValue=""
                placeholder="e.g. The Green Hall"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                name="type"
                defaultValue=""
                placeholder="e.g. Concert Hall, Cafe, Outdoor"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                defaultValue={0}
                placeholder="0"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue=""
                placeholder="City, address or landmark"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="image">Venue image</Label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-gray-600"
              />
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
