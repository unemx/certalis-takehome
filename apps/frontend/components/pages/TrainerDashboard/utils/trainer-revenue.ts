import type { TrainingSessionDto } from "@repo/api";
import { TrainingSessionStatus } from "@repo/api/constants";

export const getConfirmedSessionRevenueCents = (
  session: TrainingSessionDto,
): number => {
  if (session.status !== TrainingSessionStatus.Confirmed) {
    return 0;
  }

  return session.priceCents * session.bookingCount;
};

export const isSessionInCalendarMonth = (
  session: TrainingSessionDto,
  referenceDate: Date,
): boolean => {
  const startsAt = new Date(session.startsAt);

  return (
    startsAt.getFullYear() === referenceDate.getFullYear() &&
    startsAt.getMonth() === referenceDate.getMonth()
  );
};

export const getTotalRevenueCents = (
  sessions: TrainingSessionDto[],
): number =>
  sessions.reduce(
    (sum, session) => sum + getConfirmedSessionRevenueCents(session),
    0,
  );

export const getRevenueThisMonthCents = (
  sessions: TrainingSessionDto[],
  referenceDate: Date = new Date(),
): number =>
  sessions
    .filter((session) => isSessionInCalendarMonth(session, referenceDate))
    .reduce(
      (sum, session) => sum + getConfirmedSessionRevenueCents(session),
      0,
    );
