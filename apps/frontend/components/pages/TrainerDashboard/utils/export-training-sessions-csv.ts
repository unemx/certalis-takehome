import type { TrainingSessionDto } from "@repo/api";
import { formatDateISO } from "@repo/utils";

const CSV_HEADERS = [
  "title",
  "date",
  "location",
  "bookingCount",
  "capacity",
  "status",
] as const;

const CSV_FORMULA_PREFIX_PATTERN = /^[=+\-@]/;

const escapeCsvField = (value: string | number): string => {
  const text = String(value);
  const safeText = CSV_FORMULA_PREFIX_PATTERN.test(text) ? `'${text}` : text;
  if (/[",\n\r]/.test(safeText)) {
    return `"${safeText.replace(/"/g, '""')}"`;
  }
  return safeText;
};

const buildCsvRow = (fields: (string | number)[]): string =>
  fields.map(escapeCsvField).join(",");

export const exportTrainingSessionsToCsv = (
  sessions: TrainingSessionDto[],
): void => {
  const rows = [
    CSV_HEADERS.join(","),
    ...sessions.map((session) =>
      buildCsvRow([
        session.title,
        formatDateISO(session.startsAt),
        session.location,
        session.bookingCount,
        session.capacity,
        session.status,
      ]),
    ),
  ];

  const blob = new Blob([`${rows.join("\n")}\n`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sessions-formateur-${formatDateISO(new Date())}.csv`;
  anchor.setAttribute("aria-hidden", "true");
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
