import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import {
  CancelTrainingSessionDto,
  QueryTrainingSessionsDto,
} from "@repo/api";

import { TrainingSessionService } from "../services/training-session.service";

@Controller("training-sessions")
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
  ) {}

  @Get()
  listTrainingSessions(@Query() query: QueryTrainingSessionsDto) {
    return this.trainingSessionService.listTrainingSessions(query);
  }

  @Patch(":id/cancel")
  cancelTrainingSession(
    @Param("id") id: string,
    @Body() body: CancelTrainingSessionDto,
  ) {
    return this.trainingSessionService.cancelTrainingSession(id, body);
  }
}
