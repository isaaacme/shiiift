import { useState, useEffect } from 'react';

export function useToolSession<S>(toolId: string, initial: S) {
  const key = `shiiift_tool_${toolId}`;

  const [state, setStateRaw] = useState<S>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  function setState(next: S | ((prev: S) => S)) {
    setStateRaw((prev) => {
      const value = typeof next === 'function' ? (next as (p: S) => S)(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
      return value;
    });
  }

  function clearSession() {
    try { localStorage.removeItem(key); } catch {}
    setStateRaw(initial);
  }

  return [state, setState, clearSession] as const;
}

export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  try {
    // Plausible
    if ((window as any).plausible) {
      (window as any).plausible(name, { props });
    }
    // PostHog
    if ((window as any).posthog) {
      (window as any).posthog.capture(name, props);
    }
    // Umami
    if ((window as any).umami) {
      (window as any).umami.track(name, props);
    }
    // console dev fallback
    try {
      if ((import.meta as any).env?.DEV) console.log('[track]', name, props);
    } catch {}
  } catch {}
}
