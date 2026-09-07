import "server-only";
import type { ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";

import { env, isProduction } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
  /** Format recommandé : `<type>/<id>` (ex. `verify-email/user_123`). Évite les doublons pendant 24 h. */
  idempotencyKey?: string;
  tags?: Array<{ name: string; value: string }>;
};

type SendEmailResult = { ok: true; id: string | null } | { ok: false; error: string };

let resendClient: Resend | null = null;

function getResend() {
  if (!env.RESEND_API_KEY) return null;
  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
}

/** Extrait la première URL du texte brut (pour l'affichage console en développement). */
function extractFirstUrl(text: string) {
  return text.match(/https?:\/\/\S+/)?.[0] ?? null;
}

/**
 * Envoie un email transactionnel via Resend (HTML + texte brut).
 *
 * Sans `RESEND_API_KEY` hors production, l'email est affiché dans la console du serveur
 * (sujet, destinataire et lien) afin de tester les parcours sans compte Resend.
 * Le SDK Resend ne lève pas d'exception : on inspecte `error` explicitement.
 */
export async function sendEmail({ to, subject, react, idempotencyKey, tags }: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResend();

  if (!resend) {
    if (isProduction) {
      console.error("[email] RESEND_API_KEY manquante : email non envoyé", { to, subject });
      return { ok: false, error: "RESEND_API_KEY manquante" };
    }
    const text = await render(react, { plainText: true });
    console.info(
      [
        "",
        "┌──────────────── EMAIL (mode console, pas de RESEND_API_KEY) ────────────────",
        `│ À      : ${to}`,
        `│ Sujet  : ${subject}`,
        `│ Lien   : ${extractFirstUrl(text) ?? "(aucun)"}`,
        "└─────────────────────────────────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );
    return { ok: true, id: null };
  }

  const text = await render(react, { plainText: true });
  const { data, error } = await resend.emails.send(
    { from: env.EMAIL_FROM, to, subject, react, text, tags },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  if (error) {
    // Ne jamais remonter le détail à l'utilisateur (risque de fuite d'information).
    console.error("[email] échec d'envoi", { to, subject, name: error.name, message: error.message });
    return { ok: false, error: error.name };
  }

  return { ok: true, id: data?.id ?? null };
}
