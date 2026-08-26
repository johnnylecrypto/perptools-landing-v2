import { cn } from "@/lib/utils";

/**
 * Page frame: a fixed 61.5px gutter on both sides at every width, with the
 * content inside free to grow — it is never capped to the 1440 design width.
 */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-side w-full", className)} {...props} />;
}
