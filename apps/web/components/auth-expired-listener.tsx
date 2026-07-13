"use client";

import { useEffect, useRef } from "react";

import { UNAUTHORIZED_EVENT } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";

// Mounted once near the app root. Bounces the user to /login (with a
// `next` param back to where they were) whenever an authenticated request
// comes back 401 — e.g. an expired access token. The "session expired"
// toast is shown by the login page itself (via the `expired` param) rather
// than here, since a toast fired right before a full-page navigation never
// gets a chance to render.
export function AuthExpiredListener() {
  const logout = useAuth((s) => s.logout);
  const handledRef = useRef(false);

  useEffect(() => {
    const onUnauthorized = () => {
      if (handledRef.current) return;
      if (window.location.pathname.startsWith("/login")) return;
      handledRef.current = true;

      logout();

      const next = window.location.pathname + window.location.search;
      window.location.href = `/login?expired=1&next=${encodeURIComponent(next)}`;
    };

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  return null;
}
