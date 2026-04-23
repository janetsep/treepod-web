"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsEventName } from "../lib/analytics";

export default function TrackView({
  eventName,
  params,
}: {
  eventName: AnalyticsEventName;
  params?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(eventName, params);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
