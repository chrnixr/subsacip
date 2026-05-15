import { randomUUID } from "node:crypto";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { PaymentType } from "../common/enums";

@Entity({ name: "payment_methods" })
export class PaymentMethod {
  @PrimaryColumn({ type: "varchar", length: 64 })
  id: string;

  @Column({ type: "enum", enum: PaymentType })
  type: PaymentType;

  @Column({ type: "varchar", length: 160 })
  label: string;

  @Column({ type: "varchar", length: 4, nullable: true })
  last4?: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  bank?: string | null;

  @Column({ type: "varchar", length: 32, nullable: true })
  phone?: string | null;

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
