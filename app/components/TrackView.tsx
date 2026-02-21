"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEventName } from "../lib/analytics";

export default function TrackView({
  eventName,
  params,
}: {
  eventName: AnalyticsEventName;
  params?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackEvent(eventName, params);
  }, [eventName, params]);

  return null;
}
