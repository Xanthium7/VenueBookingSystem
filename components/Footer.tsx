"use client";
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 mt-10">
      <div className="mx-auto max-w-7xl px-5 text-center space-y-4">
        <h3 className="text-2xl font-light uppercase tracking-[0.3em] text-neutral-900 dark:text-neutral-100">
          Vebe
        </h3>
        <p className="mx-auto max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
          “Crafting a frictionless venue booking experience.”
        </p>
      </div>
      <div className="mt-10 text-center text-xs text-neutral-500 dark:text-neutral-500">
        © {new Date().getFullYear()} Vebe. All rights reserved.
      </div>
    </footer>
  );
}
