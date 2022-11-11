import { GlobalService } from 'src/services/global-service/global-service.service';

export enum TPM_COMMANDS {
  INITIALIZE = 'init',
  STIMULATE = 'stimulate-and-calculate',
  RUN = 'calculate',
  TRAIN = 'train',
  CHECK_HEALTH = 'health-check',
}

export enum LEARNING_RULES {
  HEBBIAN = 0,
  ANTI_HEBBIAN = 1,
  RANDOM_WALK = 2,
}

export enum TPM_STATES {
  NOT_INITIALIZED = -1,
  INITIALIZED = 1,
  CALCULATING = 2,
  LEARNING = 3,
}

export enum MICROSERVER_ERRORS {
  RESPONSE_ERROR = 100,
  NO_RESPONSE = 200,
  NO_REQUEST = 300,
}

export const generateRandomStimulus = (k: number, n: number) => {
  const output: number[][] = [];
  for (let i = 0; i < k; i++) {
    output[i] = [];
    for (let j = 0; j < n; j++) {
      output[i][j] = generateRandomSignedFactor();
    }
  }

  return output;
};

const generateRandomSignedFactor = () => {
  const firstPass = Math.random() - 0.5;
  const output = Math.sign(firstPass);
  return output;
};

export const checkWeights = (
  weightsA: number[][],
  weightsB: number[][],
): boolean => {
  if (!weightsA || !weightsB) return false;
  const rowLenA = weightsA.length;
  const rowLenB = weightsB.length;
  if (!weightsA[0] || !weightsB[0]) return false;
  const colLenA = weightsA[0].length;
  const colLenB = weightsB[0].length;

  if (rowLenA != rowLenB || colLenA != colLenB) {
    console.log('Weights lengths dont match');
    return;
  }
  for (let i = 0; i < rowLenA; i++) {
    for (let j = 0; j < colLenA; j++) {
      const elementA = weightsA[i][j];
      const elementB = weightsB[i][j];
      if (elementA != elementB) return false;
    }
  }

  return true;
};

export const checkStageSync = () => {
  const connectedTpms = GlobalService.connectedTpms;
  for (let i = 0; i < connectedTpms.length; i++) {
    const tpm = connectedTpms[i];
    if (tpm.iterState != GlobalService.learnSession.targetStage) return false;
    if (tpm.iterCount != GlobalService.learnSession.targetIterCount)
      return false;
  }
  return true;
};

export const checkTpmSync = () => {
  const connectedTpms = GlobalService.connectedTpms;
  const baseTpm = connectedTpms[0];
  for (let i = 1; i < connectedTpms.length; i++) {
    const tpm = connectedTpms[i];
    const areEqual = checkWeights(baseTpm.weights, tpm.weights);
    if (!areEqual) return false;
  }
  return true;
};

export const checkOutputSync = () => {
  const connectedTpms = GlobalService.connectedTpms;
  const baseTpm = connectedTpms[0];
  for (let i = 1; i < connectedTpms.length; i++) {
    const tpm = connectedTpms[i];
    if (baseTpm.output != tpm.output) {
      console.log(
        `Base: ${baseTpm.output.toString()} | TPM: ${tpm.output.toString()}`,
      );
      return false;
    }
  }
  return true;
};
