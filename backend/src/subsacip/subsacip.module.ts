import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentMethodsModule } from "../payment-methods/payment-methods.module";
import { Subsacip } from "./subsacip.entity";
import { SubsacipController } from "./subsacip.controller";
import { SubsacipService } from "./subsacip.service";

@Module({
  imports: [TypeOrmModule.forFeature([Subsacip]), PaymentMethodsModule],
  controllers: [SubsacipController],
  providers: [SubsacipService],
  exports: [SubsacipService],
})
export class SubsacipModule {}
