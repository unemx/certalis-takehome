"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TrainingSessionStatus } from "@repo/api/constants";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { cn } from "@repo/ui/lib/utils";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cancelTrainingSession } from "@/services/api/training-session/training-session";

const schema = z.object({
  reason: z.string().trim().min(1, "Le motif est obligatoire"),
});

type Schema = z.infer<typeof schema>;

type Props = {
  sessionId: string;
  sessionTitle: string;
  status: string;
};

export const CancelTrainingSessionDialog: FC<Props> = ({
  sessionId,
  sessionTitle,
  status,
}) => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  if (status !== TrainingSessionStatus.Pending) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await cancelTrainingSession(sessionId, values);
      toast.success("Session annulée");
      reset();
      setOpen(false);
    } catch {
      toast.error("Impossible d'annuler la session");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Annuler
        </Button>
      </DialogTrigger>
      <DialogContent maxWidth="480px">
        <DialogHeader>
          <DialogTitle>Annuler la session</DialogTitle>
          <DialogDescription>{sessionTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="w-full space-y-2">
              <label
                htmlFor="cancellationReason"
                className="block text-sm font-medium"
              >
                Motif d&apos;annulation
              </label>
              <textarea
                id="cancellationReason"
                rows={4}
                className={cn(
                  "w-full resize-y rounded-lg border border-black-100 px-3 py-2 transition-colors",
                  "bg-white text-black-700 placeholder:text-placeholder",
                  "hover:shadow-sm focus:border-black-300 focus:shadow-sm focus:outline-none",
                  errors.reason && "border-red-500",
                )}
                aria-invalid={errors.reason ? true : undefined}
                aria-describedby={
                  errors.reason ? "cancellationReason-error" : undefined
                }
                {...register("reason")}
              />
              {errors.reason ? (
                <p
                  id="cancellationReason-error"
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.reason.message}
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Fermer
            </Button>
            <Button
              type="submit"
              variant="default"
              isLoading={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
