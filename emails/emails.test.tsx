import { render } from "react-email";
import { describe, expect, it } from "vitest";

import MagicLinkEmail from "./magic-link";
import ResetPasswordEmail from "./reset-password";
import VerifyEmail from "./verify-email";

describe("templates d'emails", () => {
  it("VerifyEmail contient le lien et le prénom en HTML et en texte brut", async () => {
    const url = "https://example.com/api/auth/verify-email?token=abc";
    const html = await render(<VerifyEmail name="Marie" url={url} />);
    const text = await render(<VerifyEmail name="Marie" url={url} />, { plainText: true });
    expect(html).toContain(url);
    expect(html).toContain("Marie");
    expect(text).toContain(url);
  });

  it("ResetPasswordEmail et MagicLinkEmail contiennent le lien", async () => {
    const url = "https://example.com/reset-password?token=abc";
    expect(await render(<ResetPasswordEmail name="Marie" url={url} />, { plainText: true })).toContain(url);
    expect(await render(<MagicLinkEmail url={url} />, { plainText: true })).toContain(url);
  });
});
