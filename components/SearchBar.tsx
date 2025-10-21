"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const initialQuery = params.get("query") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const newParams = new URLSearchParams(params?.toString());
    if (trimmed) {
      newParams.set("query", trimmed);
    } else {
      newParams.delete("query");
    }
    const searchString = newParams.toString();
    const target = searchString
      ? `${pathname}?${searchString}#venues`
      : `${pathname}#venues`;
    router.push(target);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 bg-white/25  backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-xl border border-white/30  ring-1 ring-black/5 max-w-3xl mx-auto flex flex-col md:flex-row gap-4 md:items-end"
    >
      <div className="flex-1">
        <div className="mt-1 flex rounded-xl h-11 overflow-hidden border border-white/40  bg-black/20  backdrop-blur px-3 focus-within:ring-2 focus-within:ring-neutral-900/40  transition">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your venue..."
            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-white/80 placeholder:font-light"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="h-11 md:h-[46px] rounded-xl px-8 font-medium shadow-lg shadow-black/10"
      >
        Search
      </Button>
    </form>
  );
}
