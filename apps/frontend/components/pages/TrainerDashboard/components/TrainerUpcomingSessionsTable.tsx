import type { TrainingSessionDto } from "@repo/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { formatDateHuman } from "@repo/utils";
import { FC } from "react";

import { TrainingSessionStatusBadge } from "@/components/pages/TrainingSessions/components/TrainingSessionStatusBadge";

type Props = {
  sessions: TrainingSessionDto[];
};

export const TrainerUpcomingSessionsTable: FC<Props> = ({ sessions }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Session</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Lieu</TableHead>
        <TableHead className="text-right">Inscrits</TableHead>
        <TableHead>Statut</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {sessions.map((session) => (
        <TableRow key={session.id}>
          <TableCell className="font-medium">{session.title}</TableCell>
          <TableCell className="text-muted-foreground">
            {formatDateHuman(session.startsAt)}
          </TableCell>
          <TableCell className="text-muted-foreground">
            {session.location}
          </TableCell>
          <TableCell className="text-right tabular-nums">
            {session.bookingCount} / {session.capacity}
          </TableCell>
          <TableCell>
            <TrainingSessionStatusBadge status={session.status} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
