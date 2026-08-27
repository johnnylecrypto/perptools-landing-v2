"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporting sink (Sentry, Axiom, ...).
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Eyebrow>{"// ERROR"}</Eyebrow>
      <h1 className="mt-6 text-[clamp(32px,5vw,56px)] font-semibold tracking-[-0.03em]">
        Something went wrong.
      </h1>
      <p className="text-fg-muted mt-4 max-w-md">
        The page failed to render. Try again — if it keeps happening, the incident has been logged.
      </p>
      {error.digest ? (
        <p className="text-fg-faint mt-3 font-mono text-xs">digest: {error.digest}</p>
      ) : null}
      <Button onClick={reset} className="mt-10">
        Try again
      </Button>
    </Container>
  );
}
