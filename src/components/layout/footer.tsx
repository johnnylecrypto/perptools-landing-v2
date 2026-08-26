import Link from "next/link";
import { footerNav } from "@/content/navigation";
import { Logo } from "@/components/layout/logo";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-line bg-bg-1 border-t">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-fg font-mono text-sm font-semibold tracking-[0.16em] uppercase"
        >
          PERP<span className="text-accent">Tools</span>
        </Link>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {footerNav.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg-muted hover:text-fg text-sm transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-fg-muted hover:text-fg text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-fg-faint font-mono text-xs">
          © {new Date().getFullYear()} {site.name}
        </p>
      </Container>
    </footer>
  );
}
