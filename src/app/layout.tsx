import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono, DM_Sans } from "next/font/google";
import { DeferredGoogleAnalytics } from "@/components/analytics/deferred-google-analytics";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { site } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "perpetual futures",
    "perp dex",
    "trading agents",
    "onchain trading",
    "omnichain liquidity",
    "Orderly Network",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitter,
    creator: site.twitter,
    title: site.title,
    description: site.description,
  },
  robots: {
    index: !site.noindex,
    follow: !site.noindex,
    googleBot: { index: !site.noindex, follow: !site.noindex, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="dns-prefetch" href="https://a.perptools.ai" />
        <link
          rel="preload"
          as="image"
          href="/media/bg-removal.webp"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      </head>
      <body className="bg-bg-0 text-fg flex min-h-full flex-col antialiased">
        <PostHogProvider>
          <a
            href="#main"
            className="focus:bg-accent focus:text-fg-on-accent sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </PostHogProvider>
        <DeferredGoogleAnalytics />
      </body>
    </html>
  );
}
