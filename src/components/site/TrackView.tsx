"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Dispara um evento de visualização uma vez ao montar a página. */
export function TrackView({ event, params }: { event: AnalyticsEvent; params?: Record<string, string> }) {
  const key = JSON.stringify(params ?? {});
  useEffect(() => {
    track(event, JSON.parse(key));
  }, [event, key]);
  return null;
}
