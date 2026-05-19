import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AnalyticsService } from '../analytics/analytics.service'; // <-- Importar el servicio

@Injectable()
export class AdvisorService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(AdvisorService.name);

  // Inyectamos el servicio de analíticas en el constructor
  constructor(private readonly analyticsService: AnalyticsService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  private async fetchFromGeminiWithRetry(prompt: string, maxRetries: number = 3): Promise<any> {
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (!response.text) {
          throw new Error('Respuesta vacía del modelo');
        }

        return JSON.parse(response.text); // <-- El return salvador

      } catch (error: any) {
        attempt++;
        
        if (attempt > maxRetries || (error.status && error.status < 500 && error.status !== 429)) {
          this.logger.error(`Fallo definitivo al contactar con la IA tras ${attempt - 1} reintentos.`);
          throw new InternalServerErrorException('El servicio de análisis no está disponible temporalmente.');
        }

        const delay = Math.pow(2, attempt - 1) * 1000;
        this.logger.warn(`Intento ${attempt} fallido. Reintentando en ${delay}ms...`);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async getFinancialAdvice(userId: string) {
    this.logger.log(`📊 Extrayendo métricas de PostgreSQL para el usuario ${userId}...`);

    try {
      // 1. Ejecución concurrente del Patrón Fachada
      const [gastos, ratio, runway, huchas] = await Promise.all([
        this.analyticsService.getExpensesByCategory(userId),
        this.analyticsService.getSavingsRatio(userId),
        this.analyticsService.getFinancialRunway(userId),
        this.analyticsService.getSavingGoalsProgress(userId),
      ]);

      // 2. Serialización: Convertimos los objetos nativos a texto estructurado
      const userContext = JSON.stringify({
        gastos_mes_actual: gastos,
        salud_financiera: ratio,
        meses_supervivencia: runway,
        estado_huchas: huchas
      });

      // 3. Ingeniería del Prompt
      const prompt = `
        Actúa como un asesor financiero experto. Tienes un profundo conocimiento del mercado económico actual y la gestión de patrimonios.
        A continuación, te proporciono un JSON serializado con el análisis financiero real de este mes de mi cliente.
        
        Datos deterministas del cliente:
        ${userContext}

        REGLA ESTRICTA: Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta, sin texto adicional ni formato markdown:
        {
          "analisis_general": "Breve resumen analítico de la situación actual basado en los datos proporcionados",
          "alerta": "Aviso si hay algún riesgo grave en el ratio de ahorro, gastos o runway (o null si todo es estable)",
          "recomendacion_mercado": "Un consejo práctico, realista y de nivel avanzado para optimizar su capital, relacionando sus datos con buenas prácticas de mercado"
        }
      `;

      this.logger.log('🤖 Contexto empaquetado. Solicitando análisis a la IA...');
      
      // 4. Llamada blindada con retroceso exponencial
      return await this.fetchFromGeminiWithRetry(prompt);

    } catch (error) {
      this.logger.error(`Error al generar el consejo financiero: ${error.message}`);
      throw new InternalServerErrorException('No se pudo procesar el análisis financiero en este momento.');
    }
  }
}
