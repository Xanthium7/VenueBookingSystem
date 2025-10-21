"use client";
import Link from "next/link";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

import { AddVenue } from "./AddVenue";

export function Navbar() {
  const currentUserRole = useQuery(api.users.getCurrentUserRole);
  const isAdmin = currentUserRole?.role === "admin";

  return (
    <>
      <header className="sticky  top-0 z-40 bg-gradient-to-tr from-black/95 via-neutral-900/90 to-neutral-900/80 backdrop-blur-xl border-b-[1px] border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between gap-6 text-white/80">
          <Link
            href="/"
            className="text-2xl  tracking-tight text-white font-light"
          >
            V E B E
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-light uppercase ">
            <Link href="/" className="hover:opacity-70 transition-colors">
              Venues
            </Link>
            <Link href="/" className="hover:opacity-70 transition-colors">
              Explore
            </Link>
            <Link
              href="/my-bookings"
              className="hover:opacity-70 transition-colors"
            >
              My Bookings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Authenticated>
              {isAdmin && <AddVenue />}
              <UserButton
                appearance={{ elements: { userButtonBox: "text-white/80" } }}
              />
            </Authenticated>
            <Unauthenticated>
              <Button asChild size="sm" variant="outline" className=" ">
                <Link href="/sign-in" className="text-neutral-800 ">
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" className="text-white/80">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </Unauthenticated>
          </div>
        </div>
      </header>
    </>
  );
}
