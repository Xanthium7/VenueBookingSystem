'use client';
import { SignIn } from "@clerk/nextjs";


const bannerImageUrl =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80";

export default function Page() {
  return (
    <>
    <style jsx global>{`
        .cl-footer,
        .cl-branding,
        [data-localization-key*="developmentMode"],
        [data-localization-key*="footerTitle"],
        [data-localization-key*="footerActionText"],
        [data-localization-key*="footerActionLink"] {
          display: none !important;
        }
      `}</style>
    <div className="min-h-screen grid grid-cols-1 bg-black text-white lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div
          aria-hidden={true}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black/60" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="text-xl uppercase tracking-[0.1em] text-neutral-200 pt-10">
              V E B E
            </p>
          <div className=" w-full h-full flex justify-center items-center flex-col">
            
            <h1 className="mt-6 max-w-md text-4xl font-light leading-tight  mx-auto">
              Create unforgettable experiences in minimalist spaces.
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Tailored venues for every vision. Curated with intention.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white text-black">
        <div className="w-full max-w-md px-10 py-12">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              Welcome back.
            </h2>
            <p className="mt-3 text-sm text-neutral-500">
              Sign in to continue planning your next venue experience.
            </p>
          </div>

          <SignIn
              appearance={{
                elements: {
                  rootBox:
                    "[&_a[href*='clerk.com']]:hidden [&_[data-localization-key*='developmentMode']]:hidden",
                  card: "shadow-none border border-neutral-200 bg-transparent p-0 text-black",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  footer: "hidden",
                  footerActionText: "hidden",
                  footerActionLink: "hidden",
                  formFieldLabel:
                    "text-xs uppercase tracking-[0.3em] text-neutral-500",
                  formFieldInput:
                    "rounded-none border-black bg-white text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-0",
                  formButtonPrimary:
                    "rounded-none border border-black bg-black text-white transition hover:bg-white hover:text-black",
                  socialButtonsBlockButton:
                    "rounded-none border border-black bg-white text-black transition hover:bg-black hover:text-white",
                  dividerText: "text-neutral-400",
                },
                variables: {
                  colorPrimary: "black",
                  colorText: "black",
                },
              }}
              signUpUrl="/sign-up"
            />
        </div>
      </div>
    </div>
  </>
  );
}
