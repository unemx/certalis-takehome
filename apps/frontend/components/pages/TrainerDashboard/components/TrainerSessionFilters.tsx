import {
  TrainingSessionStatus,
  type TrainingSessionStatus as TrainingSessionStatusType,
} from "@repo/api/constants";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { cn } from "@repo/ui/lib/utils";
import { FC } from "react";

export type TrainerSessionFiltersValues = {
  status: TrainingSessionStatusType | "";
  from: string;
  to: string;
};

type Props = {
  values: TrainerSessionFiltersValues;
  onChange: (values: TrainerSessionFiltersValues) => void;
};

const STATUS_FILTER_OPTIONS: {
  value: TrainerSessionFiltersValues["status"];
  label: string;
}[] = [
  { value: "", label: "Tous les statuts" },
  { value: TrainingSessionStatus.Pending, label: "En attente" },
  { value: TrainingSessionStatus.Confirmed, label: "Confirmée" },
  { value: TrainingSessionStatus.Cancelled, label: "Annulée" },
];

export const TrainerSessionFilters: FC<Props> = ({ values, onChange }) => {
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...values,
      status: event.target.value as TrainerSessionFiltersValues["status"],
    });
  };

  const handleFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, from: event.target.value });
  };

  const handleToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, to: event.target.value });
  };

  return (
    <fieldset className="mb-6 space-y-4 border-0 p-0">
      <legend className="sr-only">Filtres des sessions</legend>
      <p className="text-sm font-medium text-black-700">Filtres</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="trainer-session-status">Statut</Label>
          <select
            id="trainer-session-status"
            value={values.status}
            onChange={handleStatusChange}
            aria-label="Filtrer par statut"
            className={cn(
              "h-10 w-full rounded-lg border border-black-100 bg-white px-3 py-2 text-sm text-black-700",
              "transition-colors hover:shadow-sm",
              "focus:border-black-300 focus:outline-none focus:shadow-sm",
            )}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="trainer-session-from"
          type="date"
          label="Du"
          value={values.from}
          onChange={handleFromChange}
          aria-label="Date de début"
        />
        <Input
          id="trainer-session-to"
          type="date"
          label="Au"
          value={values.to}
          onChange={handleToChange}
          aria-label="Date de fin"
        />
      </div>
    </fieldset>
  );
};
