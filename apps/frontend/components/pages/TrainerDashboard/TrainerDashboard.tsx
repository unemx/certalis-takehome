"use client";

import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { FC } from "react";

import { TrainerUpcomingSessionsTable } from "./components/TrainerUpcomingSessionsTable";
import { exportTrainingSessionsToCsv } from "./utils/export-training-sessions-csv";

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
  const today = formatLocalDateISO(new Date());
  const { data, error, isLoading } = useTrainingSessions({
    trainerId,
    from: today,
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-destructive">
          Erreur lors du chargement des sessions.
        </p>
      </main>
    );
  }

  const sessions = data?.items ?? [];

  const handleExportCsv = () => {
    exportTrainingSessionsToCsv(sessions);
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Dashboard formateur</CardTitle>
              <CardDescription>
                {data?.total ?? 0} session{(data?.total ?? 0) > 1 ? "s" : ""} à
                venir
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={sessions.length === 0}
              aria-label="Exporter les sessions au format CSV"
            >
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune session à venir pour ce formateur.
            </p>
          ) : (
            <TrainerUpcomingSessionsTable sessions={sessions} />
          )}
        </CardContent>
      </Card>
    </main>
  );
};
