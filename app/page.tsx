"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HotVenues } from "@/components/HotVenues";
import { VenueExplorer } from "@/components/VenueExplorer";
import { Footer } from "@/components/Footer";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

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
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 font-sans">
      { isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-neutral-200 h-40 w-40 flex justify-center items-center">
            <span className="uppercase">Loading</span>
          </div>
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        { isAuthenticated && (
          <>
            <Hero />
            <HotVenues venues={venues} />
            <VenueExplorer venues={venues} />
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}
// All component implementations extracted to /components
