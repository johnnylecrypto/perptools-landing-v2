"use client";

import Script from "next/script";

const GA_ID = "G-YVL7ETJQ52";

export function GoogleAnalytics() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_ID}', {
            linker: {
              domains: ['app.perptools.ai']
            }
          });
        `}
      </Script>
    </>
  );
}
