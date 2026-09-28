"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FieldError } from "@/components/ui/field";

/**
 * Cloudflare Turnstile (anti-robot), actif seulement si NEXT_PUBLIC_TURNSTILE_SITE_KEY est défini.
 * Le token est envoyé à Better Auth dans l'en-tête `x-captcha-response`, vérifié par le plugin
 * `captcha` (lib/auth/auth.ts) sur les endpoints de `authConfig.captchaEndpoints`.
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
// Lue directement (inlinée au build) : lib/env.ts accède à des variables serveur au chargement
// et ne peut pas être importé côté client. Sa présence est validée par lib/env.ts côté serveur.
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme: "auto" | "light" | "dark";
  size: "normal" | "flexible" | "compact";
  language: string;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Charge api.js une seule fois. Inséré depuis un script Next.js, il est autorisé par 'strict-dynamic'. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile indisponible")));
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("Chargement de Turnstile impossible"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * État du captcha pour un formulaire d'authentification.
 * Un token Turnstile est à usage unique : appeler `reset()` après chaque appel à Better Auth.
 */
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const reset = useCallback(() => {
    setToken(null);
    setResetKey((key) => key + 1);
  }, []);

  return {
    enabled: Boolean(siteKey),
    /** Faux tant que le challenge n'est pas résolu (toujours vrai si Turnstile est désactivé). */
    ready: !siteKey || token !== null,
    /** Options de requête à passer à Better Auth (`fetchOptions`). */
    fetchOptions: siteKey && token ? { headers: { "x-captcha-response": token } } : undefined,
    reset,
    widgetProps: { onToken: setToken, resetKey },
  };
}

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  /** Change à chaque `reset()` : le widget est recréé pour obtenir un nouveau token. */
  resetKey: number;
};

export function TurnstileWidget({ onToken, resetKey }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    let widgetId: string | undefined;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        setLoadError(false);
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          // Turnstile réessaie seul ; on invalide simplement le token courant.
          "error-callback": () => onTokenRef.current(null),
          theme: "auto",
          size: "flexible",
          language: "fr",
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [resetKey]);

  if (!siteKey) return null;

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {loadError ? (
        <FieldError>La vérification anti-robot n&apos;a pas pu être chargée. Rechargez la page.</FieldError>
      ) : null}
    </div>
  );
}
