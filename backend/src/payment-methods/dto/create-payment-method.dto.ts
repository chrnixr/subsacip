import { IsEnum, IsOptional, IsString, Length, Matches } from "class-validator";
import { PaymentType } from "../../common/enums";

export class CreatePaymentMethodDto {
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  last4?: string;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
