import type { TrainerSessionFiltersValues } from "../components/TrainerSessionFilters";

import type { UseTrainingSessionsParams } from "@/services/api/training-session/training-session";

export const buildTrainingSessionsQueryParams = (
  trainerId: string,
  filters: TrainerSessionFiltersValues,
): UseTrainingSessionsParams => {
  const params: UseTrainingSessionsParams = { trainerId };

  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.from) {
    params.from = filters.from;
  }
  if (filters.to) {
    params.to = filters.to;
  }

  return params;
};

export const hasActiveSessionFilters = (
  filters: TrainerSessionFiltersValues,
  defaultFrom: string,
): boolean =>
  filters.status !== "" ||
  filters.from !== defaultFrom ||
  filters.to !== "";

export const formatFilteredSessionsDescription = (
  total: number,
  filtersActive: boolean,
): string => {
  const countLabel = `${total} session${total === 1 ? "" : "s"}`;

  if (filtersActive) {
    return `${countLabel} correspondant aux filtres`;
  }

  return `${countLabel} à venir`;
};
