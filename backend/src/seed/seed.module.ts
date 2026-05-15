import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HistoryEntry } from "../history/history-entry.entity";
import { PaymentMethod } from "../payment-methods/payment-method.entity";
import { Subsacip } from "../subsacip/subsacip.entity";
import { SeedService } from "./seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, Subsacip, HistoryEntry])],
  providers: [SeedService],
})
export class SeedModule {}
