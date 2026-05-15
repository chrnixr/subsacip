import { randomUUID } from "node:crypto";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { BillingCycle, Category, PaymentType } from "../common/enums";

@Entity({ name: "history_entries" })
export class HistoryEntry {
  @PrimaryColumn({ type: "varchar", length: 64 })
  id: string;

  @Column({ type: "varchar", length: 64, name: "subscription_id", nullable: true })
  subscriptionId?: string | null;

  @Column({ type: "varchar", length: 160 })
  name: string;

  @Column({ type: "varchar", length: 240 })
  description: string;

  @Column({ type: "integer" })
  price: number;

  @Column({ type: "date", name: "paid_date" })
  paidDate: string;

  @Column({ type: "enum", enum: PaymentType, name: "payment_type" })
  paymentType: PaymentType;

  @Column({ type: "varchar", length: 4, name: "payment_last4" })
  paymentLast4: string;

  @Column({ type: "enum", enum: BillingCycle })
  cycle: BillingCycle;

  @Column({ type: "varchar", length: 7 })
  color: string;

  @Column({ type: "enum", enum: Category })
  category: Category;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @BeforeInsert()
  assignId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
