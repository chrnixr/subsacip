import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOrigin = configuredOrigins.includes("*")
    ? true
    : configuredOrigins.length > 0
      ? configuredOrigins
      : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          const isLocalDev = !origin || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
          callback(null, isLocalDev);
        };

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen(port, host);
}

void bootstrap();
