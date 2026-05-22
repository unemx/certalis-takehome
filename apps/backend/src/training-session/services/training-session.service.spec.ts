import { Test } from "@nestjs/testing";
import { TrainingSessionStatus } from "@repo/api/constants";

import { TrainingSessionService } from "./training-session.service";
import { TrainingSessionRepository } from "../repositories/training-session.repository";

const PENDING_SESSION = {
  id: "session-1",
  title: "SST",
  sector: "safety" as const,
  status: TrainingSessionStatus.Pending,
  startsAt: new Date("2026-06-01"),
  endsAt: new Date("2026-06-01"),
  location: "Paris",
  priceCents: 10000,
  capacity: 10,
  trainerId: "trainer-1",
};

describe("TrainingSessionService", () => {
  let service: TrainingSessionService;
  let repository: {
    findByIdOrFail: jest.Mock;
    cancelPendingSession: jest.Mock;
    findByIdWithBookingCount: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findByIdOrFail: jest.fn().mockResolvedValue(PENDING_SESSION),
      cancelPendingSession: jest.fn().mockResolvedValue(PENDING_SESSION),
      findByIdWithBookingCount: jest.fn().mockResolvedValue({
        ...PENDING_SESSION,
        status: TrainingSessionStatus.Cancelled,
        trainer: { firstName: "Camille", lastName: "Dubois" },
        bookingCount: 2,
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TrainingSessionService,
        { provide: TrainingSessionRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(TrainingSessionService);
  });

  it("rejects cancel when session is not pending", async () => {
    repository.findByIdOrFail.mockResolvedValue({
      ...PENDING_SESSION,
      status: TrainingSessionStatus.Confirmed,
    });

    await expect(
      service.cancelTrainingSession("session-1", { reason: "Indisponible" }),
    ).rejects.toMatchObject({
      errorCode: "TRAINING_SESSION_NOT_PENDING",
    });
    expect(repository.cancelPendingSession).not.toHaveBeenCalled();
  });

  it("cancels a pending session with reason", async () => {
    const result = await service.cancelTrainingSession("session-1", {
      reason: "Indisponible",
    });

    expect(repository.cancelPendingSession).toHaveBeenCalledWith(
      "session-1",
      "Indisponible",
    );
    expect(result.status).toBe(TrainingSessionStatus.Cancelled);
    expect(result.bookingCount).toBe(2);
  });

  it("rejects cancel when session stops being pending during update", async () => {
    repository.cancelPendingSession.mockResolvedValue(null);

    await expect(
      service.cancelTrainingSession("session-1", { reason: "Indisponible" }),
    ).rejects.toMatchObject({
      errorCode: "TRAINING_SESSION_NOT_PENDING",
    });
    expect(repository.findByIdWithBookingCount).not.toHaveBeenCalled();
  });
});
