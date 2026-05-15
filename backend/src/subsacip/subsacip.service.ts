import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentMethodsService } from "../payment-methods/payment-methods.service";
import { CreateSubsacipDto } from "./dto/create-subsacip.dto";
import { PaymentSnapshotDto } from "./dto/payment-snapshot.dto";
import { UpdateSubsacipDto } from "./dto/update-subsacip.dto";
import { Subsacip } from "./subsacip.entity";

@Injectable()
export class SubsacipService {
  constructor(
    @InjectRepository(Subsacip)
    private readonly subscriptions: Repository<Subsacip>,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  async findAll() {
    const rows = await this.subscriptions.find({
      order: {
        active: "DESC",
        nextBillingDate: "ASC",
        createdAt: "DESC",
      },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: string) {
    return this.toResponse(await this.getEntity(id));
  }

  async create(dto: CreateSubsacipDto) {
    const payment = await this.resolvePayment(dto.paymentMethodId, dto.payment);
    const row = this.subscriptions.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || dto.name.trim(),
      price: dto.price,
      cycle: dto.cycle,
      nextBillingDate: dto.nextBillingDate,
      paymentType: payment.type,
      paymentLast4: payment.last4,
      paymentMethodId: dto.paymentMethodId,
      category: dto.category,
      color: dto.color,
      active: dto.active ?? true,
    });

    return this.toResponse(await this.subscriptions.save(row));
  }

  async update(id: string, dto: UpdateSubsacipDto) {
    const row = await this.getEntity(id);
    const payment = await this.resolvePayment(dto.paymentMethodId, dto.payment, {
      type: row.paymentType,
      last4: row.paymentLast4,
    });

    Object.assign(row, {
      name: dto.name?.trim() ?? row.name,
      description: dto.description?.trim() ?? row.description,
      price: dto.price ?? row.price,
      cycle: dto.cycle ?? row.cycle,
      nextBillingDate: dto.nextBillingDate ?? row.nextBillingDate,
      paymentType: payment.type,
      paymentLast4: payment.last4,
      paymentMethodId: dto.paymentMethodId ?? row.paymentMethodId,
      category: dto.category ?? row.category,
      color: dto.color ?? row.color,
      active: dto.active ?? row.active,
    });

    return this.toResponse(await this.subscriptions.save(row));
  }

  async remove(id: string) {
    const row = await this.getEntity(id);
    await this.subscriptions.remove(row);
  }

  private async getEntity(id: string) {
    const row = await this.subscriptions.findOneBy({ id });
    if (!row) {
      throw new NotFoundException(`Subscription ${id} was not found`);
    }
    return row;
  }

  private async resolvePayment(
    paymentMethodId?: string,
    payment?: PaymentSnapshotDto,
    fallback?: PaymentSnapshotDto,
  ): Promise<PaymentSnapshotDto> {
    if (paymentMethodId) {
      const paymentMethod = await this.paymentMethodsService.findOne(paymentMethodId);
      const last4 = paymentMethod.last4 ?? paymentMethod.phone?.replace(/\D/g, "").slice(-4);
      if (!last4) {
        throw new BadRequestException("Selected payment method does not expose a last4 value");
      }
      return {
        type: paymentMethod.type,
        last4,
      };
    }

    if (payment) {
      return payment;
    }

    if (fallback) {
      return fallback;
    }

    throw new BadRequestException("Either paymentMethodId or payment is required");
  }

  private toResponse(row: Subsacip) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      cycle: row.cycle,
      nextBillingDate: row.nextBillingDate,
      payment: {
        type: row.paymentType,
        last4: row.paymentLast4,
      },
      paymentMethodId: row.paymentMethodId,
      category: row.category,
      color: row.color,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
