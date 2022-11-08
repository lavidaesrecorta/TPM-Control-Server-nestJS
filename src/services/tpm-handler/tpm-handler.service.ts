import { HttpService } from '@nestjs/axios';
import { Global, HttpException, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TrainingSettings, TpmWeights, LearnSession } from 'src/interfaces';
import { GlobalService } from 'src/services/global-service/global-service.service';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  checkOutputSync,
  checkStageSync,
  checkTpmSync,
  generateRandomStimulus,
  handleAxiosError,
  LEARNING_RULES,
  TPM_COMMANDS,
  TPM_STATES,
} from 'src/lib/tpm-utils';

@Injectable()
export class TpmHandlerService {
  constructor(private readonly httpService: HttpService) {}

  initializeSingleTpm = async (ip: string, settings: TrainingSettings) => {
    console.log(`Initializing http://${ip}/${TPM_COMMANDS.INITIALIZE}`);
    const response = await firstValueFrom(
      this.httpService
        .post(`http://${ip}/${TPM_COMMANDS.INITIALIZE}`, settings)
        .pipe(
          map((response) => response.status),
          catchError((e) => {
            console.log('!!!Error while Initializing:');
            return handleAxiosError(e);
          }),
        ),
    );

    // console.log(response);
    if (response == 200) {
      console.log(`[${ip}] Waiting for response...`);
    } else {
      console.log('Error while initializing: ');
      console.log(response);
    }
  };

  stimulateAndRunSingleTpm = async (ip: string, stimulus: number[][]) => {
    console.log(`Stimulating http://${ip}/${TPM_COMMANDS.STIMULATE}`);
    const response = await firstValueFrom(
      this.httpService
        .post(`http://${ip}/${TPM_COMMANDS.STIMULATE}`, { stimulus: stimulus })
        .pipe(
          map((response) => response.status),
          catchError((e) => {
            console.log('!!!Error while Stimulating:');
            return handleAxiosError(e);
          }),
        ),
    );

    if (response == 200) {
      console.log(`[${ip}] Waiting for response...`);
    } else {
      console.log('Error while stimulating: ');
      console.log(response);
    }
  };

  trainSingleTpm = async (ip: string, learningRule: LEARNING_RULES) => {
    console.log(`Training http://${ip}/${TPM_COMMANDS.TRAIN}`);
    const response = await firstValueFrom(
      this.httpService
        .post(`http://${ip}/${TPM_COMMANDS.TRAIN}`, {
          learningRule: learningRule,
        })
        .pipe(
          map((response) => response.status),
          catchError((e) => {
            console.log('!!!Error while Learning:');
            return handleAxiosError(e);
          }),
        ),
    );
    const tpmIndex = GlobalService.connectedTpms.findIndex(
      (tpm) => tpm.ip == ip,
    );
    if (response == 200) {
      GlobalService.connectedTpms[tpmIndex].iterState = TPM_STATES.LEARNING;
    } else {
      console.log('Error while training: ');
      console.log(response);
    }
  };

  triggerMassStimulusCalculation = async () => {
    const settings = GlobalService.learnSession.trainingSettings;
    const stimulus = generateRandomStimulus(settings.k, settings.n);
    GlobalService.connectedTpms.forEach((tpm) => {
      this.stimulateAndRunSingleTpm(tpm.ip, stimulus);
    });
    GlobalService.learnSession.targetStage = TPM_STATES.CALCULATING;
    GlobalService.learnSession.targetIterCount += 1;
    console.log(`NEW ITERATION: ${GlobalService.learnSession.targetIterCount}`);
  };

  triggerMassLearning = async () => {
    const settings = GlobalService.learnSession.trainingSettings;
    GlobalService.connectedTpms.forEach((tpm) => {
      this.trainSingleTpm(tpm.ip, settings.learnRule);
    });
    GlobalService.learnSession.targetStage = TPM_STATES.LEARNING;
  };

  @OnEvent('training.initialize')
  handleTrainingInitializedEvent(settings: TrainingSettings) {
    GlobalService.connectedTpms.forEach((tpm) => {
      this.initializeSingleTpm(tpm.ip, settings);
    });
    const emptyWeights: TpmWeights[] = [];
    const newLearnSession: LearnSession = {
      initialWeights: emptyWeights,
      finalWeights: emptyWeights,
      targetIterCount: -1,
      targetStage: TPM_STATES.INITIALIZED,
      trainingSettings: settings,
    };
    GlobalService.learnSession = newLearnSession;
  }

  @OnEvent('training.updateWeights')
  updateWeights(tpmIndex: number, newWeights: number[][]) {
    GlobalService.connectedTpms[tpmIndex].weights = newWeights;
    const tpmIterState = GlobalService.connectedTpms[tpmIndex].iterState;
    if (tpmIterState == TPM_STATES.NOT_INITIALIZED)
      GlobalService.connectedTpms[tpmIndex].iterState = TPM_STATES.INITIALIZED;
    if (tpmIterState == TPM_STATES.CALCULATING)
      GlobalService.connectedTpms[tpmIndex].iterState = TPM_STATES.LEARNING;
    console.log(`[W]: Stages synced: ${checkStageSync()}`);
    if (checkStageSync()) {
      if (checkTpmSync()) {
        console.log('We have achieved syncrhonization.');
      } else {
        if (
          GlobalService.learnSession.targetIterCount >=
          GlobalService.maxIterations
        ) {
          console.log('We have failed.');
          return;
        }
        this.triggerMassStimulusCalculation();
      }
    }
  }

  @OnEvent('training.updateOutputs')
  updateOutputs(tpmIndex: number, output: number) {
    GlobalService.connectedTpms[tpmIndex].output = output;
    GlobalService.connectedTpms[tpmIndex].iterCount += 1;
    GlobalService.connectedTpms[tpmIndex].iterState = TPM_STATES.CALCULATING;
    console.log(
      `STARTED NEW ITERATION FOR ${GlobalService.connectedTpms[tpmIndex].ip}: ${GlobalService.connectedTpms[tpmIndex].iterCount}`,
    );
    // const tpmIterState = GlobalService.connectedTpms[tpmIndex].iterState;
    // if (tpmIterState == TPM_STATES.LEARNING)
    //   GlobalService.connectedTpms[tpmIndex].iterState = TPM_STATES.CALCULATING;

    console.log(`[O]: Stages synced: ${checkStageSync()}`);
    if (checkStageSync()) {
      if (checkOutputSync()) {
        console.log('[O]: We have output syncrhonization, time to learn');
        this.triggerMassLearning();
      } else {
        console.log(
          '[O]: We dont have output syncrhonization, try with new stimulus',
        );
        this.triggerMassStimulusCalculation();
      }
    }
  }
}
