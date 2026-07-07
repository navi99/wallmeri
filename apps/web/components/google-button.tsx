"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";
import type { AuthResponse } from "@/lib/types";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/** "Continue with Google" via Google Identity Services.
 *  Renders nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset. */
export function GoogleButton({ onSuccess }: { onSuccess: (res: AuthResponse) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        const res = await api.googleLogin(response.credential);
        setAuth(res);
        onSuccess(res);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Google sign-in failed");
      }
    },
    [setAuth, onSuccess],
  );

  useEffect(() => {
    if (!CLIENT_ID || !scriptReady || !window.google || !containerRef.current) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });
  }, [scriptReady, handleCredential]);

  if (!CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-brand-100" /> or{" "}
        <span className="h-px flex-1 bg-brand-100" />
      </div>
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
}
