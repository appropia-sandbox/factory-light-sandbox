export function allowedDomain(): string {
  return process.env.ALLOWED_EMAIL_DOMAIN ?? "appropia.com";
}

export function isAllowedEmail(email: string | null | undefined, domain = allowedDomain()): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(`@${domain.toLowerCase()}`);
}
