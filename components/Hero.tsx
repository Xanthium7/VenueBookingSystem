"use client";
import { SearchBar } from "./SearchBar";

export function Hero() {
  return (
    <section className=" overflow-hidden">
      <div className="absolute inset-0 top-0 left-0 right-0">
        <img
          src="https://picsum.photos/seed/hero-bg/1600/800"
          alt="Scenic view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-28 text-center text-neutral-50">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight max-w-4xl mx-auto">
          Discover, Compare, and Book Your Perfect Venue
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto text-neutral-200">
          Browse trusted venues for unforgettable events. Seamless booking &
          reliable spaces wherever you are.
        </p>
        <SearchBar />
      </div>
    </section>
  );
}
