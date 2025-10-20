"use client";
import { SearchBar } from "./SearchBar";

export function Hero() {
  return (
    <section className=" overflow-hidden">
      <div className="absolute inset-0 top-0 left-0 right-0">
        <img
          src="https://images.unsplash.com/photo-1679416082781-ef5bee148e30?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632"
          alt="Scenic view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-28 text-center text-neutral-50">
        <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-tight max-w-4xl mx-auto">
          Discover, Compare, and Book Your Perfect Venue
        </h1>

        <SearchBar />
      </div>
    </section>
  );
}
