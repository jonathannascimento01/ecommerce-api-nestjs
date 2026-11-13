import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller'; // <-- Ajustado para './ai.controller'

@Module({
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}