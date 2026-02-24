"use client";

import { useCallback } from "react";
import { useAppMessage } from "@daily-co/daily-react";

/**
 * Listens for CVI conversation events from the Daily.co call.
 * Events include: conversation.tool_call, conversation.utterance,
 * conversation.replica.started_speaking, etc.
 */
export function useObservableEvent(
  callback: (event: Record<string, unknown>) => void
) {
  useAppMessage({
    onAppMessage: useCallback(
      (event: { data?: Record<string, unknown> }) => {
        if (event?.data) {
          callback(event.data);
        }
      },
      [callback]
    ),
  });
}
