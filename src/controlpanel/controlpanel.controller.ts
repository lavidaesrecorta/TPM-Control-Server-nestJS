import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConnectedTpm } from 'src/interfaces/connected-tpm.interface';
import { GlobalService } from 'src/global-service/global-service.service';
import { TrainingSettings } from 'src/interfaces/training-settings.interface';
import { TpmOutput } from 'src/interfaces/tpm-output.interface';
import { TpmWeights } from 'src/interfaces/tpm-weights.interface';

@Controller('controlpanel')
export class ControlpanelController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Get('tpm-list')
  getTpmList() {
    return GlobalService.connectedTpms;
  }

  @Get('session-data')
  getSessionData() {
    return GlobalService.learnSession;
  }

  @Post('tpm-init')
  initializeTpms(@Body() initParameters: TrainingSettings) {
    if (GlobalService.connectedTpms.length > 0) {
      this.eventEmitter.emit('training.initialize', initParameters);
      return 'Event dispatched.';
    }
    return 'There are no connected devices.';
  }

  @Post('add-tpm')
  addTpm(@Body() tpmIp: { ip: string }) {
    if (tpmIp.ip) {
      if (
        GlobalService.connectedTpms.findIndex((tpm) => tpm.ip == tpmIp.ip) == -1
      ) {
        const newTpm: ConnectedTpm = {
          ip: tpmIp.ip,
          weights: [],
          output: 0,
          iterState: -1,
          iterCount: -1,
        };
        GlobalService.connectedTpms.push(newTpm);
        console.log(`Added ip: ${newTpm.ip}`);
        return `Added ip: ${newTpm.ip}`;
      }
      return `Cannot add ip [${tpmIp}] because it is already connected.`;
    }
    return 'Cannot add an empty address.';
  }

  @Post('recieve-output')
  recieveOutput(@Body() tpmOutput: TpmOutput) {
    if (tpmOutput.ip) {
      const tpmIndex = GlobalService.connectedTpms.findIndex(
        (tpm) => tpm.ip == tpmOutput.ip,
      );
      if (tpmIndex == -1) {
        return `Requested TPM [${tpmOutput.ip}] does not exist`;
      } else {
        this.eventEmitter.emit(
          'training.updateOutputs',
          tpmIndex,
          tpmOutput.output,
        );
        return 'ok!';
      }
    }

    return 'error...';
  }

  @Post('recieve-weights')
  recieveWeights(@Body() tpmWeights: TpmWeights) {
    if (tpmWeights.ip) {
      const tpmIndex = GlobalService.connectedTpms.findIndex(
        (tpm) => tpm.ip == tpmWeights.ip,
      );
      if (tpmIndex == -1) {
        return `Requested TPM [${tpmWeights.ip}] does not exist`;
      } else {
        this.eventEmitter.emit(
          'training.updateWeights',
          tpmIndex,
          tpmWeights.weights,
        );
        console.log(`Updating weights for TPM [${tpmWeights.ip}]`);
        return `Updating weights for TPM [${tpmWeights.ip}]`;
      }
    }
    return 'error...';
  }
}
