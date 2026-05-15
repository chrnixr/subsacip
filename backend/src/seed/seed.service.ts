import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BillingCycle, Category, PaymentType } from "../common/enums";
import { HistoryEntry } from "../history/history-entry.entity";
import { PaymentMethod } from "../payment-methods/payment-method.entity";
import { Subsacip } from "../subsacip/subsacip.entity";

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethods: Repository<PaymentMethod>,
    @InjectRepository(Subsacip)
    private readonly subscriptions: Repository<Subsacip>,
    @InjectRepository(HistoryEntry)
    private readonly historyEntries: Repository<HistoryEntry>,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.get<string>("SEED_DATABASE", "true") !== "true") {
      return;
    }

    const existingSubscriptions = await this.subscriptions.count();
    if (existingSubscriptions > 0) {
      return;
    }

    await this.paymentMethods.save([
      {
        id: "pm1",
        type: PaymentType.Visa,
        last4: "4242",
        label: "Visa ---- 4242",
      },
      {
        id: "pm2",
        type: PaymentType.Mastercard,
        last4: "8832",
        label: "MC ---- 8832",
      },
      {
        id: "pm3",
        type: PaymentType.Amex,
        last4: "0005",
        label: "Amex ---- 0005",
      },
    ]);

    await this.subscriptions.save([
      {
        id: "1",
        name: "Netflix",
        description: "Standard with ads",
        price: 379,
        cycle: BillingCycle.Monthly,
        nextBillingDate: "2026-05-18",
        paymentType: PaymentType.Visa,
        paymentLast4: "4242",
        paymentMethodId: "pm1",
        category: Category.Entertainment,
        color: "#9B4040",
        active: true,
      },
      {
        id: "2",
        name: "Spotify",
        description: "Premium Individual",
        price: 99,
        cycle: BillingCycle.Monthly,
        nextBillingDate: "2026-05-22",
        paymentType: PaymentType.Mastercard,
        paymentLast4: "8832",
        paymentMethodId: "pm2",
        category: Category.Entertainment,
        color: "#4A7A5A",
        active: true,
      },
      {
        id: "3",
        name: "GitHub",
        description: "Pro Plan",
        price: 1399,
        cycle: BillingCycle.Yearly,
        nextBillingDate: "2027-01-15",
        paymentType: PaymentType.Visa,
        paymentLast4: "4242",
        paymentMethodId: "pm1",
        category: Category.Developer,
        color: "#3D3028",
        active: true,
      },
      {
        id: "4",
        name: "Notion",
        description: "Plus Plan",
        price: 2999,
        cycle: BillingCycle.Yearly,
        nextBillingDate: "2026-11-20",
        paymentType: PaymentType.Amex,
        paymentLast4: "0005",
        paymentMethodId: "pm3",
        category: Category.Productivity,
        color: "#4A3728",
        active: true,
      },
      {
        id: "5",
        name: "Figma",
        description: "Professional",
        price: 5699,
        cycle: BillingCycle.Yearly,
        nextBillingDate: "2026-09-03",
        paymentType: PaymentType.Visa,
        paymentLast4: "4242",
        paymentMethodId: "pm1",
        category: Category.Productivity,
        color: "#8B4A30",
        active: true,
      },
      {
        id: "6",
        name: "iCloud",
        description: "200 GB Storage",
        price: 35,
        cycle: BillingCycle.Monthly,
        nextBillingDate: "2026-05-16",
        paymentType: PaymentType.Mastercard,
        paymentLast4: "8832",
        paymentMethodId: "pm2",
        category: Category.Cloud,
        color: "#4A6080",
        active: true,
      },
      {
        id: "7",
        name: "Adobe CC",
        description: "All Apps",
        price: 28900,
        cycle: BillingCycle.Yearly,
        nextBillingDate: "2026-08-11",
        paymentType: PaymentType.Amex,
        paymentLast4: "0005",
        paymentMethodId: "pm3",
        category: Category.Productivity,
        color: "#7A3030",
        active: false,
      },
    ]);

    await this.historyEntries.save([
      this.history("h-may-1", "1", "Netflix", "Standard with ads", 379, "2026-05-01", PaymentType.Visa, "4242", BillingCycle.Monthly, "#9B4040", Category.Entertainment),
      this.history("h-may-2", "6", "iCloud", "200 GB Storage", 35, "2026-05-03", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A6080", Category.Cloud),
      this.history("h-apr-1", "1", "Netflix", "Standard with ads", 379, "2026-04-01", PaymentType.Visa, "4242", BillingCycle.Monthly, "#9B4040", Category.Entertainment),
      this.history("h-apr-2", "2", "Spotify", "Premium Individual", 99, "2026-04-28", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A7A5A", Category.Entertainment),
      this.history("h-apr-3", "6", "iCloud", "200 GB Storage", 35, "2026-04-03", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A6080", Category.Cloud),
      this.history("h-mar-1", "1", "Netflix", "Standard with ads", 379, "2026-03-01", PaymentType.Visa, "4242", BillingCycle.Monthly, "#9B4040", Category.Entertainment),
      this.history("h-mar-2", "2", "Spotify", "Premium Individual", 99, "2026-03-28", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A7A5A", Category.Entertainment),
      this.history("h-mar-3", "6", "iCloud", "200 GB Storage", 35, "2026-03-03", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A6080", Category.Cloud),
      this.history("h-mar-4", "5", "Figma", "Professional", 5699, "2026-03-09", PaymentType.Visa, "4242", BillingCycle.Yearly, "#8B4A30", Category.Productivity),
      this.history("h-feb-1", "1", "Netflix", "Standard with ads", 379, "2026-02-01", PaymentType.Visa, "4242", BillingCycle.Monthly, "#9B4040", Category.Entertainment),
      this.history("h-feb-2", "2", "Spotify", "Premium Individual", 99, "2026-02-28", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A7A5A", Category.Entertainment),
      this.history("h-feb-3", "6", "iCloud", "200 GB Storage", 35, "2026-02-03", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A6080", Category.Cloud),
      this.history("h-jan-1", "1", "Netflix", "Standard with ads", 379, "2026-01-01", PaymentType.Visa, "4242", BillingCycle.Monthly, "#9B4040", Category.Entertainment),
      this.history("h-jan-2", "2", "Spotify", "Premium Individual", 99, "2026-01-28", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A7A5A", Category.Entertainment),
      this.history("h-jan-3", "6", "iCloud", "200 GB Storage", 35, "2026-01-03", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A6080", Category.Cloud),
      this.history("h-jan-4", "3", "GitHub", "Pro Plan", 1399, "2026-01-15", PaymentType.Visa, "4242", BillingCycle.Yearly, "#3D3028", Category.Developer),
      this.history("h-jan-5", "7", "Adobe CC", "All Apps", 28900, "2026-01-11", PaymentType.Amex, "0005", BillingCycle.Yearly, "#7A3030", Category.Productivity),
      this.history("h-dec-1", "1", "Netflix", "Standard with ads", 379, "2025-12-01", PaymentType.Visa, "4242", BillingCycle.Monthly, "#9B4040", Category.Entertainment),
      this.history("h-dec-2", "2", "Spotify", "Premium Individual", 99, "2025-12-28", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A7A5A", Category.Entertainment),
      this.history("h-dec-3", "6", "iCloud", "200 GB Storage", 35, "2025-12-03", PaymentType.Mastercard, "8832", BillingCycle.Monthly, "#4A6080", Category.Cloud),
      this.history("h-dec-4", "4", "Notion", "Plus Plan", 2999, "2025-12-20", PaymentType.Amex, "0005", BillingCycle.Yearly, "#4A3728", Category.Productivity),
    ]);
  }

  private history(
    id: string,
    subscriptionId: string,
    name: string,
    description: string,
    price: number,
    paidDate: string,
    paymentType: PaymentType,
    paymentLast4: string,
    cycle: BillingCycle,
    color: string,
    category: Category,
  ) {
    return {
      id,
      subscriptionId,
      name,
      description,
      price,
      paidDate,
      paymentType,
      paymentLast4,
      cycle,
      color,
      category,
    };
  }
}
