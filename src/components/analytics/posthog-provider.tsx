"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { getPostHog } from "@/lib/posthog-init";

type PHProviderProps = {
  client: unknown;
  children: ReactNode;
};

function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    void (async () => {
      const posthog = await getPostHog();
      let url = window.origin + pathname;
      const query = window.location.search;
      if (query) url += query;
      posthog.capture("$pageview", { $current_url: url });
    })();
  }, [pathname]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<ComponentType<PHProviderProps> | null>(null);
  const [client, setClient] = useState<unknown>(null);

  useEffect(() => {
    const load = () => {
      void (async () => {
        const [{ PostHogProvider: PHProvider }, posthog] = await Promise.all([
          import("posthog-js/react"),
          getPostHog(),
        ]);
        setProvider(() => PHProvider as ComponentType<PHProviderProps>);
        setClient(posthog);
      })();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(load, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!Provider || !client) {
    return <>{children}</>;
  }

  return (
    <Provider client={client}>
      <PostHogPageView />
      {children}
    </Provider>
  );
}
