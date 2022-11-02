import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControlpanelController } from './controlpanel/controlpanel.controller';
import { GlobalService } from './services/global-service/global-service.service';
import { TpmHandlerService } from './services/tpm-handler/tpm-handler.service';

@Module({
  imports: [EventEmitterModule.forRoot(), HttpModule],
  controllers: [AppController, ControlpanelController],
  providers: [AppService, GlobalService, TpmHandlerService],
})
export class AppModule {}
