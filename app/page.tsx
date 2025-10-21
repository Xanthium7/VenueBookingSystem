"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HotVenues } from "@/components/HotVenues";
import { VenueExplorer } from "@/components/VenueExplorer";
import { Footer } from "@/components/Footer";
import { NotificationFooter } from "@/components/NotificationFooter";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  const serverVenues = useQuery(api.venues.getVenues);
  // console.log("serverVenues", serverVenues);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 font-sans">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-neutral-200 h-40 w-40 flex justify-center items-center">
            <span className="uppercase">Loading</span>
          </div>
        </div>
      )}

      <main className="flex-1 pb-24">
        {isAuthenticated && (
          <>
            <Hero />
            <HotVenues venues={serverVenues} />
            <VenueExplorer />
          </>
        )}
      </main>
      <Footer />
      {isAuthenticated && <NotificationFooter />}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
// All component implementations extracted to /components
