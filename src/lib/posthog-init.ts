import type { PostHog } from "posthog-js";

const POSTHOG_PROJECT_TOKEN =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_u2twSN5xfZ9XDLTVc4qCNEueM5bNRySJw454Rjv97S7d";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://a.perptools.ai";

let posthogInitialized = false;

export function isPostHogInitialized() {
  return posthogInitialized;
}

function captureFirstTouchSource(posthog: PostHog) {
  const params = new URLSearchParams(window.location.search);

  const ref = params.get("ref");
  const gclid = params.get("gclid");
  const gadSource = params.get("gad_source");

  const firstTouchProps: Record<string, string> = {};

  if (ref) firstTouchProps["$initial_ref"] = ref;
  if (gclid) firstTouchProps["$initial_gclid"] = gclid;
  if (gadSource) firstTouchProps["$initial_gad_source"] = gadSource;

  if (Object.keys(firstTouchProps).length > 0) {
    posthog.register_once(firstTouchProps);
    posthog.setPersonProperties(firstTouchProps);
  }
}

export async function initPostHog() {
  if (posthogInitialized || typeof window === "undefined") return;

  const { default: posthog } = await import("posthog-js");
  posthog.init(POSTHOG_PROJECT_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: "2026-05-30",
    capture_pageview: false,
    person_profiles: "always",
    cross_subdomain_cookie: true,
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
    capture_performance: true,
  });
  posthog.register({ site_type: "landing" });
  captureFirstTouchSource(posthog);
  posthogInitialized = true;
}

export async function getPostHog() {
  await initPostHog();
  const { default: posthog } = await import("posthog-js");
  return posthog;
}
