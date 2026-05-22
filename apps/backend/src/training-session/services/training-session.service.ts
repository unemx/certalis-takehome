import { Injectable } from "@nestjs/common";
import type {
  CancelTrainingSessionDto,
  PageDto,
  QueryTrainingSessionsDto,
  TrainingSessionDto,
} from "@repo/api";
import { TrainingSessionStatus } from "@repo/api/constants";
import { EntityNotFoundError } from "typeorm";

import { ApiException } from "../../utils/errors/api.exception";
import { ErrorCode } from "../../utils/errors/error-codes";
import { mapTrainingSessionToDto } from "../mappers/training-session.mapper";
import { TrainingSessionRepository } from "../repositories/training-session.repository";
import type { BaseTrainingSession } from "../types/training-session.repository.types";

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
    let session: BaseTrainingSession;
    try {
      session = await this.trainingSessionRepository.findByIdOrFail(id);
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        ApiException.with(ErrorCode.TrainingSessionNotFound, { sessionId: id });
      }

      throw error;
    }

    if (session.status !== TrainingSessionStatus.Pending) {
      ApiException.with(ErrorCode.TrainingSessionNotPending, { sessionId: id });
    }

    const cancelled = await this.trainingSessionRepository.cancelPendingSession(
      id,
      body.reason,
    );
    if (!cancelled) {
      ApiException.with(ErrorCode.TrainingSessionNotPending, { sessionId: id });
    }

    const updated =
      await this.trainingSessionRepository.findByIdWithBookingCount(id);
    if (!updated) {
      ApiException.with(ErrorCode.TrainingSessionNotFound, { sessionId: id });
    }

    return mapTrainingSessionToDto(updated);
  }
}
