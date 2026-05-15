import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { CreateHistoryEntryDto } from "./dto/create-history-entry.dto";
import { HistoryEntry } from "./history-entry.entity";

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntry)
    private readonly historyEntries: Repository<HistoryEntry>,
  ) {}

  async findAll(year?: number) {
    const where = year
      ? {
          paidDate: Between(`${year}-01-01`, `${year}-12-31`),
        }
      : {};
    const rows = await this.historyEntries.find({
      where,
      order: {
        paidDate: "DESC",
        createdAt: "DESC",
      },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async create(dto: CreateHistoryEntryDto) {
    const row = this.historyEntries.create({
      subscriptionId: dto.subscriptionId,
      name: dto.name.trim(),
      description: dto.description?.trim() || dto.name.trim(),
      price: dto.price,
      paidDate: dto.paidDate,
      paymentType: dto.payment.type,
      paymentLast4: dto.payment.last4,
      cycle: dto.cycle,
      color: dto.color,
      category: dto.category,
    });

    return this.toResponse(await this.historyEntries.save(row));
  }

  private toResponse(row: HistoryEntry) {
    return {
      id: row.id,
      subscriptionId: row.subscriptionId,
      name: row.name,
      description: row.description,
      price: row.price,
      paidDate: row.paidDate,
      payment: {
        type: row.paymentType,
        last4: row.paymentLast4,
      },
      cycle: row.cycle,
      color: row.color,
      category: row.category,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
