import { ConnectedTpm } from './connected-tpm.interface';

export interface IterationData {
  currentIteration: number;
  connectedTrees: ConnectedTpm[];
  stimulus: number[][];
}
