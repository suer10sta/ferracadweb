export type LicenseDisplayStatus =
  | "active"
  | "trial"
  | "provisional"
  | "pending"
  | "expired"
  | "none";

export function getLicenseDisplayStatus(reg: any): LicenseDisplayStatus {
  if (!reg) return "none";

  const status = String(reg.status ?? "").toLowerCase();
  const isDatePassed =
    !!reg.expirationDate && new Date(reg.expirationDate) < new Date();

  if (status === "provisional" && !isDatePassed) return "provisional";
  if (status === "active" && !isDatePassed) return "active";
  if (
    (status === "freetrial" || status === "période d'essai") &&
    !isDatePassed
  ) {
    return "trial";
  }
  if (status === "pending" && !isDatePassed) return "pending";
  if (status === "expire" || status === "expired" || isDatePassed) {
    return "expired";
  }
  if (status === "inactive") return "expired";

  return "expired";
}

export function getUserLicenseSummary(registrations: any[]) {
  const counts = {
    active: 0,
    trial: 0,
    provisional: 0,
    pending: 0,
    expired: 0,
    total: registrations.length,
  };

  for (const reg of registrations) {
    const display = getLicenseDisplayStatus(reg);
    if (display === "none") continue;
    counts[display]++;
  }

  let licenseStatus: LicenseDisplayStatus | "none" = "none";
  if (counts.active > 0) licenseStatus = "active";
  else if (counts.provisional > 0) licenseStatus = "provisional";
  else if (counts.trial > 0) licenseStatus = "trial";
  else if (counts.pending > 0) licenseStatus = "pending";
  else if (counts.expired > 0) licenseStatus = "expired";

  return { licenseStatus, licenseStats: counts };
}
