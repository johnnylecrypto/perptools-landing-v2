import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Eyebrow>{"// 404"}</Eyebrow>
      <h1 className="mt-6 text-[clamp(32px,5vw,56px)] font-semibold tracking-[-0.03em]">
        This route doesn&apos;t exist.
      </h1>
      <p className="text-fg-muted mt-4 max-w-md">
        The page you were looking for has been moved or never existed.
      </p>
      <Button href="/" className="mt-10">
        Back to home
      </Button>
    </Container>
  );
}
