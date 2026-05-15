import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentType } from "../common/enums";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";
import { PaymentMethod } from "./payment-method.entity";

const PAYMENT_BRAND: Record<PaymentType, string> = {
  [PaymentType.Visa]: "Visa",
  [PaymentType.Mastercard]: "MC",
  [PaymentType.Amex]: "Amex",
  [PaymentType.Bank]: "Bank account",
  [PaymentType.PromptPay]: "PromptPay",
  [PaymentType.TrueMoney]: "TrueMoney",
};

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethods: Repository<PaymentMethod>,
  ) {}

  findAll() {
    return this.paymentMethods.find({
      order: { createdAt: "ASC" },
    });
  }

  async findOne(id: string) {
    const paymentMethod = await this.paymentMethods.findOneBy({ id });
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method ${id} was not found`);
    }
    return paymentMethod;
  }

  async create(dto: CreatePaymentMethodDto) {
    const last4 = dto.last4 ?? this.deriveLast4(dto.phone);
    const paymentMethod = this.paymentMethods.create({
      ...dto,
      last4,
      label: dto.label ?? this.buildLabel(dto.type, last4, dto.bank, dto.phone),
    });
    return this.paymentMethods.save(paymentMethod);
  }

  async update(id: string, dto: UpdatePaymentMethodDto) {
    const paymentMethod = await this.findOne(id);
    const nextType = dto.type ?? paymentMethod.type;
    const nextLast4 = dto.last4 ?? paymentMethod.last4 ?? this.deriveLast4(dto.phone);
    const nextBank = dto.bank ?? paymentMethod.bank;
    const nextPhone = dto.phone ?? paymentMethod.phone;

    Object.assign(paymentMethod, {
      ...dto,
      last4: nextLast4,
      label: dto.label ?? this.buildLabel(nextType, nextLast4, nextBank, nextPhone),
    });
    return this.paymentMethods.save(paymentMethod);
  }

  async remove(id: string) {
    const paymentMethod = await this.findOne(id);
    await this.paymentMethods.remove(paymentMethod);
  }

  private deriveLast4(value?: string | null) {
    return value ? value.replace(/\D/g, "").slice(-4) : undefined;
  }

  private buildLabel(type: PaymentType, last4?: string | null, bank?: string | null, phone?: string | null) {
    if (type === PaymentType.Bank && bank && last4) {
      return `${bank} ---- ${last4}`;
    }
    if ((type === PaymentType.PromptPay || type === PaymentType.TrueMoney) && phone) {
      return `${PAYMENT_BRAND[type]} ${phone}`;
    }
    if (last4) {
      return `${PAYMENT_BRAND[type]} ---- ${last4}`;
    }
    return PAYMENT_BRAND[type];
  }
}
