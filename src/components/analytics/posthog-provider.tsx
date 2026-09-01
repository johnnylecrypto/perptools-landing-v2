"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { deferUntilInteraction } from "@/lib/defer-until-interaction";
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
    deferUntilInteraction(() => {
      void (async () => {
        const [{ PostHogProvider: PHProvider }, posthog] = await Promise.all([
          import("posthog-js/react"),
          getPostHog(),
        ]);
        setProvider(() => PHProvider as ComponentType<PHProviderProps>);
        setClient(posthog);
      })();
    });
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
