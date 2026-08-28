import Image from "next/image";
import Link from "next/link";
import { footerGroups } from "@/content/navigation";
import { site } from "@/lib/site";
import { WordmarkMarquee } from "@/components/layout/wordmark-marquee";
import { WordmarkRise } from "@/components/layout/wordmark-rise";
import { DiscordIcon } from "@/components/icons/discord";
import { XIcon } from "@/components/icons/x";
import { CurrentYear } from "@/components/ui/current-year";
import { FooterLink } from "./footer-link";
import { SocialLink } from "./social-link";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050D12]">
      {/* Wide cyan wash bleeding in from above the top edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-34px] h-[146px] rounded-full bg-[linear-gradient(180deg,rgb(0_173_239/0.12)_55%,rgb(157_179_198/0.12)_100%)] blur-[96.49px]"
      />

      <div className="frame relative [--frame-max:100px] [--frame-width:1240px]">
        <div className="flex flex-col gap-6 py-6 sm:gap-16 sm:py-16">
          <div className="flex flex-col gap-6 sm:gap-16 xl:flex-row xl:gap-[156px]">
            <div className="flex w-full max-w-[455px] flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  aria-label={`${site.name} — home`}
                  className="flex items-center gap-[7.31px]"
                >
                  <Image
                    src="/brand/logo-mark.webp"
                    alt=""
                    width={51}
                    height={44}
                    className="h-[43.89px] w-[51.2px] object-contain"
                  />
                  <span className="font-dm text-[23px] leading-none font-bold tracking-[-0.01em] text-white">
                    {site.name}
                  </span>
                </Link>
                <p className="text-[14px] leading-[22px] font-medium text-white/80 sm:text-[16px]">
                  {site.blurb}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SocialLink href={site.links.x} label="PERPTools on X">
                  <XIcon className="size-[16.47px]" />
                </SocialLink>
                <SocialLink href={site.links.discord} label="PERPTools on Discord">
                  <DiscordIcon className="size-[16.47px]" />
                </SocialLink>
              </div>
            </div>

            {/* Phones stack the groups with a hairline between them, per the
                mobile design. From sm the design spaces them 204px apart, which
                only fits its exact label widths; distributing the leftover room
                keeps every label on one line at any width. */}
            <nav
              aria-label="Footer"
              className="flex flex-1 flex-col gap-5 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-16 sm:gap-y-10 sm:pt-5 xl:flex-nowrap"
            >
              {footerGroups.map((group) => (
                <div
                  key={group.title}
                  className="flex flex-col gap-5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-[rgb(217_217_217/0.06)] [&:not(:first-child)]:pt-5 sm:[&:not(:first-child)]:border-t-0 sm:[&:not(:first-child)]:pt-0"
                >
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

          <div className="flex flex-col gap-[18px] sm:gap-8">
            {/* On phones the lettering is scaled past the gutter and cropped by
                the footer's `overflow-hidden`, as in the design; from sm it fits
                the frame. The design's crop is off-centre, which reads as an
                export artefact — centring it is the defensible reading. */}
            <div className="relative w-full">
              <WordmarkMarquee className="sm:hidden" />
              <WordmarkRise className="hidden w-full sm:block" />
            </div>

            <div className="flex flex-row items-center justify-between gap-2 text-[14px] leading-[20.8px] font-medium tracking-[0.78px] text-[rgb(237_238_240/0.28)] sm:gap-6">
              <p>
                <span className="hidden sm:inline">{site.name} Protocol. </span>All Rights Reserved.
              </p>
              <p>
                © <CurrentYear buildYear={new Date().getFullYear()} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
