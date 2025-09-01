"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HotVenues } from "@/components/HotVenues";
import { VenueExplorer } from "@/components/VenueExplorer";
import { PublicLanding } from "@/components/PublicLanding";
import { Footer } from "@/components/Footer";

// Placeholder venue data (memoized so it doesn't reshuffle each render)
const generateVenues = () =>
  Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    name: `Venue ${i + 1}`,
    location: [
      "Lisbon, Portugal",
      "Paris, France",
      "Berlin, Germany",
      "New York, USA",
      "Tokyo, Japan",
      "Rome, Italy",
    ][i % 6],
    type: ["Minimalist", "Luxury", "Boutique", "Business"][i % 4],
    capacity: 50 + (i % 5) * 25,
    price: 100 + (i % 7) * 20,
    image: `https://picsum.photos/seed/venue-${i + 1}/600/400`,
    rating: (3 + (i % 3) + Math.random()).toFixed(1),
  }));

export default function Home() {
  const venues = useMemo(generateVenues, []);
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 font-sans">
      <Navbar />
      <main className="flex-1">
        <Authenticated>
          <Hero />
          <HotVenues venues={venues} />
          <VenueExplorer venues={venues} />
        </Authenticated>
        {/* <Unauthenticated>
          <PublicLanding />
        </Unauthenticated> */}
      </main>
      <Footer />
    </div>
  );
}
// All component implementations extracted to /components
