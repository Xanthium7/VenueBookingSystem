"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 mt-10">
      <div className="mx-auto max-w-7xl px-5 flex flex-col md:flex-row gap-10 md:gap-16 justify-between">
        <div className="space-y-4 max-w-sm">
          <h3 className="text-xl font-semibold">Vebe</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Crafting a frictionless venue booking experience. Browse, compare,
            and book spaces that fit your unique story.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <FooterCol title="App">
            <Link href="#venues">Venues</Link>
            <Link href="#explore">Explore</Link>
            <Link href="#about">About</Link>
          </FooterCol>
          <FooterCol title="Support">
            <Link href="#">Help Center</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
          </FooterCol>
          <FooterCol title="Company">
            <Link href="#">Careers</Link>
            <Link href="#">Partners</Link>
            <Link href="#">Press</Link>
          </FooterCol>
          <FooterCol title="Connect">
            <Link href="#">Twitter</Link>
            <Link href="#">LinkedIn</Link>
            <Link href="#">Instagram</Link>
          </FooterCol>
        </div>
      </div>
      <div className="mt-12 text-center text-xs text-neutral-500 dark:text-neutral-500">
        © {new Date().getFullYear()} Vebe. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 min-w-[120px]">
      <h4 className="font-semibold text-neutral-900 dark:text-neutral-200 text-sm uppercase tracking-wide">
        {title}
      </h4>
      <ul className="space-y-2 [&_a]:block [&_a]:text-neutral-600 [&_a:hover]:text-neutral-900 dark:[&_a]:text-neutral-400 dark:[&_a:hover]:text-neutral-200">
        {Array.isArray(children) ? (
          children.map((c, i) => <li key={i}>{c}</li>)
        ) : (
          <li>{children}</li>
        )}
      </ul>
    </div>
  );
}
