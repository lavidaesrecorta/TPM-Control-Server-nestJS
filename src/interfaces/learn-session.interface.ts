import { TpmWeights } from './tpm-weights.interface';
import { TrainingSettings } from './training-settings.interface';

export enum SESSION_STATUS {
  NOT_INITIALIZED = 0,
  PAUSED = 1,
  FINISHED = 2,
  ERROR = -1,
}

export default interface LearnSession {
  initialWeights: TpmWeights[];
  finalWeights: TpmWeights[];
  targetIterCount: number;
  targetStage: number;
  trainingSettings: TrainingSettings;
  initialStimulus: number[][];
  iterStimulus: number[][];
  sessionStatus: SESSION_STATUS;
  creationDate: number;
}
