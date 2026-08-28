import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The header's primary CTA; also reused inside the mobile menu. */

export /** 147×40 gradient pill from the design file. */
function LaunchAppButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <a
      href={site.links.app}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        "rounded-button inline-flex h-10 min-w-[147px] items-center justify-center px-3",
        "font-dm text-fg-on-accent bg-[image:var(--gradient-accent)] text-[15px] font-semibold",
        "transition-[background-image,box-shadow,transform] duration-250",
        "ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[image:var(--gradient-accent-hover)]",
        "hover:shadow-[var(--shadow-accent)]",
        className,
      )}
    >
      Launch App
    </a>
  );
}
