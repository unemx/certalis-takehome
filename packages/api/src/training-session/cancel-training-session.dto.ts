import { IsString, MinLength } from "class-validator";

export class CancelTrainingSessionDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}
