import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from "class-validator";
import { BillingCycle, Category } from "../../common/enums";
import { PaymentSnapshotDto } from "../../subsacip/dto/payment-snapshot.dto";

export class CreateHistoryEntryDto {
  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsDateString()
  paidDate: string;

  @ValidateNested()
  @Type(() => PaymentSnapshotDto)
  payment: PaymentSnapshotDto;

  @IsEnum(BillingCycle)
  cycle: BillingCycle;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color: string;

  @IsEnum(Category)
  category: Category;
}
