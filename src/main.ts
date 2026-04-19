import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: process.env.FRONTEND_DOMAIN
          ? process.env.FRONTEND_DOMAIN.split(',').map((s) => s.trim())
          : process.env.NODE_ENV === 'production'
            ? false
            : true,
        credentials: true,
      },
    });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const configService = app.get(ConfigService<AllConfigType>);

    app.enableShutdownHooks();
    app.setGlobalPrefix(
      configService.getOrThrow('app.apiPrefix', { infer: true }),
      {
        exclude: ['/', 'healthz'],
      },
    );
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useGlobalPipes(new ValidationPipe(validationOptions));
    app.useGlobalInterceptors(
      new ResolvePromisesInterceptor(),
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    if (process.env.NODE_ENV !== 'production') {
      const options = new DocumentBuilder()
        .setTitle('API')
        .setDescription('API docs')
        .setVersion('1.0')
        .addBearerAuth()
        .addGlobalParameters({
          in: 'header',
          required: false,
          name: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
          schema: {
            example: 'en',
          },
        })
        .build();

      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup('swagger', app, document);
    }

    const port = configService.getOrThrow('app.port', { infer: true });
    await app.listen(port, '0.0.0.0');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
void bootstrap();
