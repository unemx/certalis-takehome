"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { formatDateISO } from "@repo/utils";
import { FC } from "react";

import { TrainerUpcomingSessionsTable } from "./components/TrainerUpcomingSessionsTable";

import { useTrainingSessions } from "@/services/api/training-session/training-session";

type Props = {
  trainerId: string;
};

export const TrainerDashboard: FC<Props> = ({ trainerId }) => {
  const today = formatDateISO(new Date());
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

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard formateur</CardTitle>
          <CardDescription>
            {data?.total ?? 0} session{(data?.total ?? 0) > 1 ? "s" : ""} à
            venir
          </CardDescription>
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
