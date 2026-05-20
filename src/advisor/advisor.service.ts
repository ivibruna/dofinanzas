import { Injectable, InternalServerErrorException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AdvisorService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(AdvisorService.name);

  constructor(private readonly analyticsService: AnalyticsService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // --- EJECUTOR GENÉRICO CON RETROCESO EXPONENCIAL ---
  private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        
        if (attempt > maxRetries || (error.status && error.status < 500 && error.status !== 429)) {
          this.logger.error(`Fallo definitivo tras ${attempt - 1} reintentos.`);
          if (error?.status === 503 || error?.message?.includes('high demand')) {
            throw new ServiceUnavailableException('El motor de IA está saturado a nivel mundial. Inténtalo de nuevo en unos segundos.');
          }
          throw new InternalServerErrorException('Error de comunicación con el motor de análisis.');
        }

        const delay = Math.pow(2, attempt - 1) * 1000;
        this.logger.warn(`⚠️ Intento ${attempt} fallido. Reintentando en ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new InternalServerErrorException('No se pudo completar la operación con la IA.');
  }

  // --- REPORTE MENSUAL EJECUTIVO ---
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

      // 2. Serialización
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
      
      // 4. Llamada blindada
      const response = await this.executeWithRetry(() => 
        this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        })
      );

      // ✅ FIX de TypeScript: Garantizar que existe texto antes de parsear
      if (!response.text) {
        throw new Error('La IA devolvió una respuesta vacía');
      }

      return JSON.parse(response.text);

    } catch (error: any) {
      this.logger.error(`Error al generar el consejo financiero: ${error.message}`);
      throw new InternalServerErrorException('No se pudo procesar el análisis financiero en este momento.');
    }
  }

  // --- IA AGÉNTICA (CHAT INTERACTIVO) ---
  async askFinancialAdvisor(userId: string, userMessage: string) {
    const tools = [{
      functionDeclarations: [
        { name: 'getExpensesByCategory', description: 'Útil SÓLO para ver el desglose de gastos en categorías (ocio, vivienda, etc.) del MES ACTUAL. No usar para proyecciones ni históricos.' },
        { name: 'getIncomesByCategory', description: 'Útil para ver las fuentes de ingreso (nómina, extras) del MES ACTUAL.' },
        { name: 'getTopRecurringExpenses', description: 'Útil para identificar pagos recurrentes, suscripciones y fugas de capital mensuales fijas.' },
        { name: 'getSixMonthCashFlow', description: 'Útil para analizar la TENDENCIA HISTÓRICA (últimos 6 meses). Úsalo cuando el usuario pregunte cómo han evolucionado sus ingresos frente a sus gastos en el tiempo.' },
        { name: 'getNetWorthEvolution', description: 'Útil para ver la TENDENCIA HISTÓRICA del patrimonio total (últimos 6 meses). Úsalo cuando pregunte si es más rico o más pobre con el paso del tiempo.' },
        { name: 'getExpenseAverages', description: 'Útil para micro-gestión. Úsalo si el usuario quiere saber cuánto gasta de media al DÍA o a la SEMANA en el mes en curso.' },
        { name: 'getSavingGoalsProgress', description: 'Útil cuando el usuario pregunte por sus "huchas", objetivos de ahorro concretos (ej. viaje, coche) y su porcentaje de cumplimiento.' },
        { name: 'getSavingsRatio', description: 'Útil para evaluar la salud financiera macro. Devuelve el porcentaje de sus ingresos que logra retener (ahorrar) en el mes actual.' },
        { name: 'getFinancialRunway', description: 'Útil para evaluar el riesgo de quiebra. Calculo de la liquidez acutal de todas sus cuentas con su promedio de gasto en los ultimos 90 dias. Y os meses exactos de supervivencia si sus ingresos caen a cero.' },
        { name: 'getEndOfMonthForecast', description: 'Útil para predicciones. Úsalo si el usuario pregunta con cuánto dinero terminará a final de este mes basándose en su ritmo de gasto actual.' }
      ]
    }];

    const prompt = `
      Eres el asesor financiero experto de la app DOFINANZAS.
      El usuario te hace esta consulta: "${userMessage}".
      Utiliza las herramientas disponibles de forma paralela si necesitas más de un dato para construir una respuesta sólida y cruzada. No inventes cifras.
    `;

    try {
      this.logger.log('🧠 IA analizando la consulta del usuario...');
      
      let response = await this.executeWithRetry(() => 
        this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { tools: tools }
        })
      );

      // ✅ FIX de TypeScript: Guardar en una constante inmutable
      const aiFunctionCalls = response.functionCalls;

      if (aiFunctionCalls && aiFunctionCalls.length > 0) {
        this.logger.log(`⚙️ La IA ha solicitado ejecutar ${aiFunctionCalls.length} funciones en paralelo.`);

        const functionResponses = await Promise.all(
          aiFunctionCalls.map(async (call) => {
            this.logger.log(`  -> Ejecutando de forma segura: ${call.name}`);
            
            let toolResult = {};
            
            switch (call.name) {
              case 'getExpensesByCategory': toolResult = await this.analyticsService.getExpensesByCategory(userId); break;
              case 'getIncomesByCategory': toolResult = await this.analyticsService.getIncomesByCategory(userId); break;
              case 'getTopRecurringExpenses': toolResult = await this.analyticsService.getTopRecurringExpenses(userId); break;
              case 'getSixMonthCashFlow': toolResult = await this.analyticsService.getSixMonthCashFlow(userId); break;
              case 'getNetWorthEvolution': toolResult = await this.analyticsService.getNetWorthEvolution(userId); break;
              case 'getExpenseAverages': toolResult = await this.analyticsService.getExpenseAverages(userId); break;
              case 'getSavingGoalsProgress': toolResult = await this.analyticsService.getSavingGoalsProgress(userId); break;
              case 'getSavingsRatio': toolResult = await this.analyticsService.getSavingsRatio(userId); break;
              case 'getFinancialRunway': toolResult = await this.analyticsService.getFinancialRunway(userId); break;
              case 'getEndOfMonthForecast': toolResult = await this.analyticsService.getEndOfMonthForecast(userId); break;
              default:
                this.logger.warn(`Intento de ejecutar herramienta desconocida: ${call.name}`);
                toolResult = { error: "Función no reconocida por el backend de DOFINANZAS" };
            }

            return {
              functionResponse: { name: call.name, response: { data: toolResult } }
            };
          })
        );

        this.logger.log(`🔄 Datos recuperados de la BD. Enviando el lote completo a la IA...`);

        response = await this.executeWithRetry(() => 
          this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              { role: 'user', parts: [{ text: prompt }] },
              // ✅ FIX de TypeScript: Usar la constante validada
              { role: 'model', parts: aiFunctionCalls.map(fc => ({ functionCall: fc })) },
              { role: 'user', parts: functionResponses }
            ],
            config: { tools: tools }
          })
        );
      }

      return {
        pregunta: userMessage,
        respuesta_ia: response.text
      };

    } catch (error: any) {
      this.logger.error(`Error en el chat de IA multitarea: ${error.message}`);
      throw new InternalServerErrorException('El asesor no pudo procesar la consulta compuesta.');
    }
  }
}
