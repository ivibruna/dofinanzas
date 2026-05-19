import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AdvisorService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(AdvisorService.name);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // Envoltorio robusto con Exponential Backoff
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

        return JSON.parse(response.text);

      } catch (error: any) {
        attempt++;
        
        // Si superamos los intentos o el error no es recuperable (ej. 401 Credenciales inválidas), abortamos
        if (attempt > maxRetries || (error.status && error.status < 500 && error.status !== 429)) {
          this.logger.error(`Fallo definitivo al contactar con la IA tras ${attempt - 1} reintentos.`);
          throw new InternalServerErrorException('El servicio de análisis no está disponible temporalmente.');
        }

        // Cálculo del Backoff Exponencial: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        this.logger.warn(`Intento ${attempt} fallido (Error ${error.status}). Reintentando en ${delay}ms...`);
        
        // Pausamos la ejecución usando una Promesa temporal
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async getFinancialAdvice(userId: string) {
    // 1. Contexto numérico
    const mockAnalytics = `
      - Ingresos mensuales: 2600€
      - Gasto en Vivienda: 900€
      - Gasto en Ocio (último mes): 450€ (Tendencia alcista, un 20% más que el mes anterior)
      - Estado del ahorro: Fondo de emergencia al 70% (8500€ de 12000€).
    `;

    // 2. Ingeniería del Prompt
    const prompt = `
      Actúa como un asesor financiero experto y analítico.
      Analiza el siguiente resumen financiero mensual de tu cliente y devuelve un consejo accionable basado en las leyes del mercado y la salud financiera.
      
      Datos del cliente:
      ${mockAnalytics}

      REGLA ESTRICTA: Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta, sin texto adicional:
      {
        "analisis_general": "Breve resumen de la situación",
        "alerta": "Aviso si hay algún riesgo (o null si todo está perfecto)",
        "recomendacion_mercado": "Un consejo práctico y realista para optimizar su capital"
      }
    `;

    this.logger.log('🤖 Solicitando análisis a la IA...');
    
    // 3. Llamada blindada
    return this.fetchFromGeminiWithRetry(prompt);
  }
}
