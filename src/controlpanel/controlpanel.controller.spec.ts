import { Test, TestingModule } from '@nestjs/testing';
import { ControlpanelController } from './controlpanel.controller';

describe('ControlpanelController', () => {
  let controller: ControlpanelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControlpanelController],
    }).compile();

    controller = module.get<ControlpanelController>(ControlpanelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
