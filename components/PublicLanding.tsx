"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicLanding() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/public-hero/1600/900"
            alt="Modern venue"
            className="w-full h-full object-cover brightness-[0.55]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/70" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 py-32 text-center text-neutral-50">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Book Exceptional Venues Effortlessly
          </h1>
          <p className="mt-6 text-lg max-w-2xl mx-auto text-neutral-200">
            Sign in to explore curated spaces tailored for meetings, events, and
            creative productions.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/sign-in">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 backdrop-blur"
            >
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
      <section id="about" className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Seamless Booking. Exceptional Spaces.
            </h2>
            <p className="mt-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Vebe connects professionals and creators with flexible venues
              across the globe. From minimalist studios to luxury lounges,
              discover spaces that elevate every experience.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild className="rounded-full px-6">
                <Link href="/sign-in">Explore Venues</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link href="/sign-up">Join Now</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <img
                key={n}
                src={`https://picsum.photos/seed/about-${n}/400/500`}
                alt="Venue"
                className={cn(
                  "w-full h-40 object-cover rounded-xl",
                  n % 2 === 0 ? "mt-6" : ""
                )}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
