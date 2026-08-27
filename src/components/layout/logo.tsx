import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Header/footer lockup: mark + wordmark, sized from the v2 design file
 * (43×37 mark inside a 40px-tall block).
 */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      aria-label="PERPTools — home"
      onClick={onClick}
      className={cn("flex h-10 items-center gap-1.5", className)}
    >
      <Image
        src="/logo-mark.webp"
        alt=""
        width={40}
        height={40}
        priority
        sizes="40px"
        className="size-10 shrink-0 object-contain"
      />
      <span className="font-dm text-[19px] leading-none font-bold tracking-[-0.01em] text-white">
        PERPTools
      </span>
    </Link>
  );
}
