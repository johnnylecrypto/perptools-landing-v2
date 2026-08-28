import type { LandingEvent } from "./analytics-events";

export type { LandingEvent } from "./analytics-events";

export async function captureLandingEvent(
  event: LandingEvent,
  properties: Record<string, unknown> = {},
) {
  const { getPostHog } = await import("./posthog-init");
  const posthog = await getPostHog();
  posthog.capture(event, properties, { transport: "sendBeacon" });
}
