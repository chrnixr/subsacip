import { Type } from "class-transformer";
import {
  IsBoolean,
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
import { PaymentSnapshotDto } from "./payment-snapshot.dto";

export class CreateSubsacipDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsEnum(BillingCycle)
  cycle: BillingCycle;

  @IsDateString()
  nextBillingDate: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentSnapshotDto)
  payment?: PaymentSnapshotDto;

  @IsEnum(Category)
  category: Category;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
