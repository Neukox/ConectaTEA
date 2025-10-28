import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de cookies
  app.use(cookieParser());

  // Configuração CORS
  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  });

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Prefixo global para todas as rotas
  app.setGlobalPrefix("api");

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle("ConectaTEA API")
    .setDescription("API do sistema ConectaTEA")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3000);
  console.log("🚀 Servidor NestJS rodando na porta 3000");
  console.log("📚 Documentação disponível em: http://localhost:3000/api/docs");
}
bootstrap();
