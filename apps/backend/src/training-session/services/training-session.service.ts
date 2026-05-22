import { Injectable } from "@nestjs/common";
import type {
  CancelTrainingSessionDto,
  PageDto,
  QueryTrainingSessionsDto,
  TrainingSessionDto,
} from "@repo/api";
import { TrainingSessionStatus } from "@repo/api/constants";

import { ApiException } from "../../utils/errors/api.exception";
import { ErrorCode } from "../../utils/errors/error-codes";
import { mapTrainingSessionToDto } from "../mappers/training-session.mapper";
import { TrainingSessionRepository } from "../repositories/training-session.repository";

@Injectable()
export class TrainingSessionService {
  constructor(
    private readonly trainingSessionRepository: TrainingSessionRepository,
  ) {}

  async listTrainingSessions(
    query: QueryTrainingSessionsDto,
  ): Promise<PageDto<TrainingSessionDto>> {
    const [sessions, total] =
      await this.trainingSessionRepository.findAllWithBookingCount(query);
    return {
      items: sessions.map(mapTrainingSessionToDto),
      total,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };
  }

  async cancelTrainingSession(
    id: string,
    body: CancelTrainingSessionDto,
  ): Promise<TrainingSessionDto> {
    let session;
    try {
      session = await this.trainingSessionRepository.findByIdOrFail(id);
    } catch {
      ApiException.with(ErrorCode.TrainingSessionNotFound, { sessionId: id });
    }

    if (session.status !== TrainingSessionStatus.Pending) {
      ApiException.with(ErrorCode.TrainingSessionNotPending, { sessionId: id });
    }

    await this.trainingSessionRepository.cancelPendingSession(id, body.reason);

    const updated =
      await this.trainingSessionRepository.findByIdWithBookingCount(id);
    if (!updated) {
      ApiException.with(ErrorCode.TrainingSessionNotFound, { sessionId: id });
    }

    return mapTrainingSessionToDto(updated);
  }
}
