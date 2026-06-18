# DOFINANZAS - Prototipo Plataforma Finanzas Personales

## Descripción del Proyecto

Este repositorio contiene el código fuente del backend de **DOFINANZAS**, desarrollado como Trabajo de Fin del Máster "Máster Universitario en Análisis de Datos Masivos (Big Data) para los Negocios". 

DOFINANZAS es una plataforma de gestión financiera avanzada que combina el seguimiento tradicional de finanzas personales con un **Asesor Financiero Inteligente** basado en Inteligencia Artificial. El sistema almacena datos financieros del usuario, para tener un control total de su información, y genera recomendaciones personalizadas.

## Stack Tecnológico

El proyecto está construido bajo una arquitectura robusta y escalable utilizando las siguientes tecnologías:

* **Framework:** NestJS (Node.js / TypeScript)
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma
* **Autenticación:** JWT (JSON Web Tokens) & Passport
* **Inteligencia Artificial:** Google Gemini AI (gemini-2.5-flash)
* **Análisis/Visualización:** Metabase

## Funcionalidades Principales

* **Gestión de Usuarios:** Autenticación segura y aislamiento total de datos por usuario (`userId`).
* **Gestión de Datos Financieros:** Permite la ingesta, visualización, modificación y eliminación de cualquier dato que esté relacionado con nuestra cartera personal.
* **Motor Analítico y Gráfico:** Cálculo en tiempo real de información relevante del usuario y generación de consejos financieros basados en sus datos. Visualización mediante panel de control en Metabase.

## Instalación y Despliegue

### 1. Requisitos Previos
* **Git:** Para clonar el repositorio en local.
* **Node.js (v18 o +) y npm:** Para el entorno de ejecución y la gestión de paquetes.
* **Docker Desktop:** Para levantar los contenedores de PostgreSQL y Metabase.
* **API Key de Google Gemini:** Para inicializar el motor del Asesor Inteligente.
* **Archivo `.env`:** Obligatorio generar este archivo en la raíz del proyecto configurando correctamente las variables clave: `DATABASE_URL`, `JWT_SECRET` y `GEMINI_API_KEY`.

### 2. Comandos de ejecución para correr el proyecto en Terminal
*Nota: Ejecutar en el orden indicado.*

* `npm install` -> Instalar todas las dependencias (solo la primera vez).
* `docker-compose up -d` -> Levantar contenedor PostgreSQL y Metabase.
* `npx prisma db push` -> Aplicar cambios de Schema en BBDD.
* `npx prisma db seed` -> Generar perfiles directamente en BBDD (solo una vez o cuando se introduzcan cambios).

**Los siguientes comandos deben ejecutarse en pestañas/terminales separadas, ya que mantienen procesos activos:**
* `npx prisma studio` -> Abrir explorador visual de la BBDD.
* `npm run start:dev` -> Levantar servidor NestJS.
* `ngrok http 3000` -> (Opcional) Para exponer API al exterior para pruebas.

### 3. Pestañas que hay que tener abiertas en el navegador

**Para usar en Local:**
* `http://localhost:3000/api` -> Swagger API (Para probar los endpoints).
* `http://localhost:3001/dashboard/2-dashboard-dofinanzas?id=` -> Metabase Dashboard (Visualización de gráficos).
* `http://localhost:51212/` -> Prisma Studio (Visualización de la BBDD).

**Para usar en Remoto:**
* `https://[url-ngrok]/api` -> Swagger API Público con Ngrok (Para probar los endpoints desde dispositivos externos).

## Autor

* **Autor:** Ivan Bruna Abad
* **Linkedin:** [Ivan Bruna Abad](https://www.linkedin.com/in/ivanbrunaabad/)
* **Proyecto:** DOFINANZAS
* **Titulación:** Máster Universitario en Análisis de Datos Masivos (Big Data) para los Negocios
* **Año Académico:** 2025-2026


<p align="center">
  <img src="./assets/gif.gif" alt="chao!!" width="800">
</p>