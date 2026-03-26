"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent, type AnalyticsEventName } from "../lib/analytics";

export default function TrackedLink({
  href,
  className,
  children,
  eventName,
  params,
  secondEventName,
  secondParams,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  eventName: AnalyticsEventName;
  params?: Record<string, unknown>;
  secondEventName?: AnalyticsEventName;
  secondParams?: Record<string, unknown>;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackEvent(eventName, params);
        if (secondEventName) trackEvent(secondEventName, secondParams);
      }}
    >
      {children}
    </Link>
  );
}
