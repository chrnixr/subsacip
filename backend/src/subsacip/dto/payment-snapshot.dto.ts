import { IsEnum, IsString, Length, Matches } from "class-validator";
import { PaymentType } from "../../common/enums";

export class PaymentSnapshotDto {
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  last4: string;
}
