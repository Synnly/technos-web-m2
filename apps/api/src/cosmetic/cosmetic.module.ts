import { Module } from '@nestjs/common';
import { CosmeticController } from './cosmetic.controller';
import { CosmeticService } from './cosmetic.service';

@Module({
    controllers: [CosmeticController],
    providers: [CosmeticService],
})
export class CosmeticModule {}