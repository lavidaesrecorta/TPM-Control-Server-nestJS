import { TpmWeights } from './tpm-weights.interface';
import { TrainingSettings } from './training-settings.interface';

export default interface LearnSession {
  initialWeights: TpmWeights[];
  finalWeights: TpmWeights[];
  targetIterCount: number;
  targetStage: number;
  trainingSettings: TrainingSettings;
}
