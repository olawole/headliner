"use client";

import { useCallback } from "react";
import { useDaily } from "@daily-co/daily-react";

/**
 * Returns a function to send messages to the CVI conversation.
 * Used for sending tool call results, echo commands, context injection, etc.
 */
export function useSendAppMessage() {
  const daily = useDaily();

  return useCallback(
    (message: Record<string, unknown>) => {
      if (daily) {
        daily.sendAppMessage(message, "*");
      }
    },
    [daily]
  );
}
