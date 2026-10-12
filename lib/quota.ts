export const PERIOD_QUOTA_CENTS = 600;
export const PERIOD_DAYS = 30;
export function isActivePeriod(period: { status: string; expires_at: string }) { return period.status === 'active' && new Date(period.expires_at).getTime() > Date.now(); }
