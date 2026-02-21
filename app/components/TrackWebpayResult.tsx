"use client";

import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export default function TrackWebpayResult({ status }: { status?: string }) {
  useEffect(() => {
    if (status === "ok") {
      trackEvent("payment_success");
      return;
    }

    if (status === "fail") {
      trackEvent("payment_failed");
    }
  }, [status]);

  return null;
}
