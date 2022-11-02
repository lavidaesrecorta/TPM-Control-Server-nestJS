import { Injectable } from '@nestjs/common';
import { LearnSession } from 'src/interfaces';
import { ConnectedTpm } from 'src/interfaces/connected-tpm.interface';

@Injectable()
export class GlobalService {
  static connectedTpms: ConnectedTpm[];
  static learnSession: LearnSession;
  static maxIterations = 20;
}
