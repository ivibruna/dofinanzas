import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activamos las validaciones globales (útil para cuando hagamos los DTOs)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // --- CONFIGURACIÓN DE SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('DOFINANZAS API')
    .setDescription('API para la gestión financiera del TFM')
    .setVersion('1.0')
    // Más adelante añadiremos aquí el token JWT
    .addBearerAuth() //ESTA LINEA PARA VERIFICAR EL TOKEN AL UTILIZAR CADA METODO
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // La ruta '/api' es donde vivirá nuestra documentación
  SwaggerModule.setup('api', app, document);
  // --------------------------------

  await app.listen(3000);
}
bootstrap();
