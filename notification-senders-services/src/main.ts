import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

const PORT = process.env.PORT || 3002;

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const port = configService.get("PORT", PORT);

    await app.listen(port);
};

bootstrap();
