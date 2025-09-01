"use client";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-black/10  backdrop-blur-xl border-b-[1px] border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between gap-6 text-white/80">
        <Link href="/" className="text-2xl  tracking-tight text-white font-medium">
          Vebe
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="#venues"
            className="hover:opacity-70 transition-colors"
          >
            Venues
          </Link>
          <Link
            href="#explore"
            className="hover:opacity-70 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="#about"
            className="hover:opacity-70 transition-colors"
          >
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Authenticated>
            <Button asChild variant="outline" size="sm" className="text-black/80">
              <Link href="#explore">Book Now</Link>
            </Button>
            <UserButton
              appearance={{ elements: { userButtonBox: "text-white/80" } }}
            />
          </Authenticated>
          <Unauthenticated>
            <Button asChild size="sm" variant="outline" className="text-white/80">
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button asChild size="sm" className="text-white/80">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}
