"use client";

import { Authenticated, Unauthenticated } from "convex/react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>

      <Unauthenticated>
        <Button asChild>
          <Link href="/sign-in">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </Unauthenticated>
    </>
  );
}

function Content() {
  return <div>Authenticated content</div>;
}
