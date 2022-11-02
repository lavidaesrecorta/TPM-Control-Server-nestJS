import { Test, TestingModule } from '@nestjs/testing';
import { TpmHandlerService } from './tpm-handler.service';

describe('TpmHandlerService', () => {
  let service: TpmHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TpmHandlerService],
    }).compile();

    service = module.get<TpmHandlerService>(TpmHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
