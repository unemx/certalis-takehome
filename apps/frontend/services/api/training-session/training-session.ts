
import type { PageDto, TrainingSessionDto } from "@repo/api";
import type { TrainingSessionStatus } from "@repo/api/constants";
import { ApiRoutes } from "@repo/api/constants";
import useSWR, { mutate } from "swr";

import { apiFetcher } from "@/lib/api-client";

export type UseTrainingSessionsParams = {
  trainerId?: string;
  status?: TrainingSessionStatus;
  from?: string;
  to?: string;
};

const buildTrainingSessionsUrl = (
  params?: UseTrainingSessionsParams,
): string => {
  if (!params) {
    return ApiRoutes.trainingSessions;
  }

  const search = new URLSearchParams();

  if (params.trainerId) {
    search.set("trainerId", params.trainerId);
  }
  if (params.status) {
    search.set("status", params.status);
  }
  if (params.from) {
    search.set("from", params.from);
  }
  if (params.to) {
    search.set("to", params.to);
  }

  const query = search.toString();
  return query
    ? `${ApiRoutes.trainingSessions}?${query}`
    : ApiRoutes.trainingSessions;
};

export const useTrainingSessions = (params?: UseTrainingSessionsParams) =>
  useSWR<PageDto<TrainingSessionDto>>(
    buildTrainingSessionsUrl(params),
    apiFetcher,
  );

export const mutateTrainingSessions = () =>
  mutate(
    (key) =>
      typeof key === "string" && key.startsWith(ApiRoutes.trainingSessions),
  );
