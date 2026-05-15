import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { HistoryModule } from "./history/history.module";
import { PaymentMethodsModule } from "./payment-methods/payment-methods.module";
import { SeedModule } from "./seed/seed.module";
import { SubsacipModule } from "./subsacip/subsacip.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>("DATABASE_URL");
        const useSsl = config.get<string>("DATABASE_SSL", databaseUrl ? "true" : "false") === "true";
        const common = {
          type: "postgres" as const,
          autoLoadEntities: true,
          synchronize: config.get<string>("TYPEORM_SYNC", "true") === "true",
          logging: config.get<string>("TYPEORM_LOGGING", "false") === "true",
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          extra: useSsl ? { ssl: { rejectUnauthorized: false } } : undefined,
        };

        if (databaseUrl) {
          return {
            ...common,
            url: databaseUrl,
          };
        }

        return {
          ...common,
          host: config.get<string>("POSTGRES_HOST", "localhost"),
          port: Number(config.get<string>("POSTGRES_PORT", "5432")),
          username: config.get<string>("POSTGRES_USER", "subscription_user"),
          password: config.get<string>("POSTGRES_PASSWORD", "subscription_password"),
          database: config.get<string>("POSTGRES_DB", "subscription_manager"),
        };
      },
    }),
    PaymentMethodsModule,
    SubsacipModule,
    HistoryModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
