import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activamos las validaciones globales
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // CONFIGURACION DE SWAGGER
  const config = new DocumentBuilder()
    .setTitle('DOFINANZAS API')
    .setDescription('API para la gestión financiera del TFM')
    .setVersion('1.0')
    .addBearerAuth() //ESTA LINEA PARA VERIFICAR EL TOKEN AL UTILIZAR CADA METODO
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Permitimos que cualquier dispositivo exterior (con el tunel NGROK) pueda acceder a nuestra API
  app.enableCors({
    origin: '*', // En producción real esto RESTRINGIDO, pero lo activamos para pruebas con usuarios reales y la defenssa
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
