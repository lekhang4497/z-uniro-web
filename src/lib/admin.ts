// Admin gating. Reads a comma-separated allowlist from
// NEXT_PUBLIC_ADMIN_EMAILS at build time. Comparison is case-insensitive
// and trims whitespace, so "  Foo@Bar.com , baz@qux.com" and
// "foo@bar.com,baz@qux.com" both work.
//
// Intentionally client-side only: there are no admin endpoints on the
// backend, so the only thing the dashboard does is read /v1/models —
// information that's already public via the same endpoint without auth.
// The allowlist exists to keep the surface tidy, not to defend secrets.

const RAW = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";

const ADMIN_EMAILS: ReadonlySet<string> = new Set(
  RAW.split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function adminAllowlistConfigured(): boolean {
  return ADMIN_EMAILS.size > 0;
}
