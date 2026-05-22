"use client";

import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { formatEur } from "@repo/utils";
import { FC, useMemo, useState } from "react";

import { TrainerSessionFilters } from "./components/TrainerSessionFilters";
import type { TrainerSessionFiltersValues } from "./components/TrainerSessionFilters";
import { TrainerUpcomingSessionsTable } from "./components/TrainerUpcomingSessionsTable";
import { exportTrainingSessionsToCsv } from "./utils/export-training-sessions-csv";
import {
  getRevenueThisMonthCents,
  getTotalRevenueCents,
} from "./utils/trainer-revenue";
import {
  buildTrainingSessionsQueryParams,
  formatFilteredSessionsDescription,
  hasActiveSessionFilters,
} from "./utils/trainer-session-filters";

import { useTrainingSessions } from "@/services/api/training-session/training-session";

type Props = {
  trainerId: string;
};

const formatLocalDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const TrainerDashboard: FC<Props> = ({ trainerId }) => {
  const defaultFrom = useMemo(() => formatLocalDateISO(new Date()), []);
  const [filters, setFilters] = useState<TrainerSessionFiltersValues>({
    status: "",
    from: defaultFrom,
    to: "",
  });
  const queryParams = useMemo(
    () => buildTrainingSessionsQueryParams(trainerId, filters),
    [trainerId, filters],
  );
  const filtersActive = hasActiveSessionFilters(filters, defaultFrom);
  const {
    data: sessionsData,
    error: sessionsError,
    isLoading: isSessionsLoading,
  } = useTrainingSessions(queryParams);
  const {
    data: allSessionsData,
    error: allSessionsError,
    isLoading: isAllSessionsLoading,
  } = useTrainingSessions({ trainerId });

  if (isSessionsLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </main>
    );
  }

  if (sessionsError) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-destructive">
          Erreur lors du chargement des sessions.
        </p>
      </main>
    );
  }

  const visibleSessions = sessionsData?.items ?? [];
  const total = sessionsData?.total ?? 0;
  const description = formatFilteredSessionsDescription(total, filtersActive);
  const allSessions = allSessionsData?.items ?? [];
  const totalRevenueCents = getTotalRevenueCents(allSessions);
  const revenueThisMonthCents = getRevenueThisMonthCents(allSessions);
  const isRevenueUnavailable = Boolean(allSessionsError && !allSessionsData);

  const handleExportCsv = () => {
    exportTrainingSessionsToCsv(visibleSessions);
  };

  const renderRevenueAmount = (amountCents: number) => {
    if (isRevenueUnavailable) {
      return "Indisponible";
    }

    if (isAllSessionsLoading) {
      return "Chargement…";
    }

    return formatEur(amountCents);
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d&apos;affaires total</CardTitle>
            <CardDescription>
              Sessions confirmées (toutes dates)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {renderRevenueAmount(totalRevenueCents)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ce mois-ci</CardTitle>
            <CardDescription>
              Sessions confirmées démarrant ce mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {renderRevenueAmount(revenueThisMonthCents)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Dashboard formateur</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={visibleSessions.length === 0}
              aria-label="Exporter les sessions au format CSV"
            >
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TrainerSessionFilters values={filters} onChange={setFilters} />
          {visibleSessions.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {filtersActive
                ? "Aucune session ne correspond aux filtres."
                : "Aucune session à venir pour ce formateur."}
            </p>
          ) : (
            <TrainerUpcomingSessionsTable sessions={visibleSessions} />
          )}
        </CardContent>
      </Card>
    </main>
  );
};
