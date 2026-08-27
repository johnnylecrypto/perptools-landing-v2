import Image from "next/image";
import Link from "next/link";
import { footerGroups, type NavItem } from "@/content/navigation";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/layout/wordmark";
import { TelegramIcon, XIcon } from "@/components/layout/social-icons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050D12]">
      {/* Wide cyan wash bleeding in from above the top edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-34px] h-[146px] rounded-full bg-[linear-gradient(180deg,rgb(0_173_239/0.12)_55%,rgb(157_179_198/0.12)_100%)] blur-[96.49px]"
      />

      <div className="frame relative [--frame-max:100px] [--frame-width:1240px]">
        <div className="flex flex-col gap-16 py-16">
          <div className="flex flex-col gap-16 xl:flex-row xl:gap-[156px]">
            <div className="flex w-full max-w-[455px] flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  aria-label={`${site.name} — home`}
                  className="flex items-center gap-[7.31px]"
                >
                  <Image
                    src="/logo-mark.webp"
                    alt=""
                    width={51}
                    height={44}
                    className="h-[43.89px] w-[51.2px] object-contain"
                  />
                  <span className="font-dm text-[23px] leading-none font-bold tracking-[-0.01em] text-white">
                    {site.name}
                  </span>
                </Link>
                <p className="text-[16px] leading-[22px] font-medium text-white/80">{site.blurb}</p>
              </div>

              <div className="flex items-center gap-3">
                <SocialLink href={site.links.x} label="PERPTools on X">
                  <XIcon className="size-[16.47px]" />
                </SocialLink>
                <SocialLink href={site.links.telegram} label="PERPTools on Telegram">
                  <TelegramIcon className="size-[16.47px]" />
                </SocialLink>
              </div>
            </div>

            {/* The design spaces these 204px apart, which only fits its exact
                label widths; distributing the leftover room keeps every label on
                one line at any width. */}
            <nav
              aria-label="Footer"
              className="flex flex-1 flex-wrap justify-start gap-x-12 gap-y-10 pt-5 sm:justify-between sm:gap-x-16 xl:flex-nowrap"
            >
              {footerGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-5">
                  <h2 className="text-[12px] font-bold tracking-[1.8px] whitespace-nowrap text-[rgb(129_134_137/0.9)] uppercase">
                    {group.title}
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <FooterLink item={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-8">
            <Wordmark className="h-auto w-full" />

            <div className="flex flex-col justify-between gap-2 text-[14px] leading-[20.8px] font-medium tracking-[0.78px] text-[rgb(237_238_240/0.28)] sm:flex-row sm:items-center sm:gap-6">
              <p>{site.name} Protocol. All Rights Reserved.</p>
              <p>© {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** 40px tall pill with a 1.18px hairline, per the design file. */
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 flex-1 items-center justify-center rounded-[9.41px] text-[#757A7D] shadow-[inset_0_0_0_1.18px_rgb(255_255_255/0.06)] transition-colors hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}

function FooterLink({ item }: { item: NavItem }) {
  const className =
    "text-[14px] whitespace-nowrap text-white/80 transition-colors hover:text-white";

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}
