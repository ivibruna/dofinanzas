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

  // --- NUEVA SECCIÓN: IA AGÉNTICA (CHAT INTERACTIVO) ---
  async askFinancialAdvisor(userId: string, userMessage: string) {
    // 1. El Menú de Herramientas (Se mantiene igual)
    const tools = [{
      functionDeclarations: [
        {
          name: 'getExpensesByCategory',
          description: 'Útil cuando el usuario pregunta en qué gasta su dinero, cuáles son sus mayores salidas de capital o pide un desglose de sus gastos del mes.',
        },
        {
          name: 'getSavingsRatio',
          description: 'Útil cuando el usuario pregunta por su salud financiera, si está ahorrando lo suficiente, o pide evaluar su capacidad de ahorro.',
        },
        {
          name: 'getFinancialRunway',
          description: 'Útil cuando el usuario pregunta por su fondo de emergencia, cuántos meses podría sobrevivir sin ingresos, o si puede afrontar una crisis.'
        }
      ]
    }];

    const prompt = `
      Eres el asesor financiero experto de la app DOFINANZAS.
      El usuario te hace esta consulta: "${userMessage}".
      Utiliza las herramientas disponibles de forma paralela si necesitas más de un dato para construir una respuesta sólida y cruzada. No inventes cifras.
    `;

    try {
      this.logger.log('🧠 IA analizando la consulta del usuario...');
      
      // Primera llamada a Gemini
      let response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: tools,
        }
      });

      // 2. Verificamos si la IA ha solicitado una o más funciones
      if (response.functionCalls && response.functionCalls.length > 0) {
        this.logger.log(`⚙️ La IA ha solicitado ejecutar ${response.functionCalls.length} funciones en paralelo.`);

        // 3. Resolución Concurrente: Mapeamos las peticiones de la IA y las ejecutamos a la vez en PostgreSQL
        const functionResponses = await Promise.all(
          response.functionCalls.map(async (call) => {
            this.logger.log(`  -> Ejecutando de forma segura: ${call.name}`);
            
            let toolResult = {};
            
            if (call.name === 'getExpensesByCategory') {
              toolResult = await this.analyticsService.getExpensesByCategory(userId);
            } else if (call.name === 'getSavingsRatio') {
              toolResult = await this.analyticsService.getSavingsRatio(userId);
            } else if (call.name === 'getFinancialRunway') {
              toolResult = await this.analyticsService.getFinancialRunway(userId);
            } else {
              toolResult = { error: "Función no reconocida por el backend" };
            }

            // Devolvemos la estructura exacta que exige el protocolo de Gemini para respuestas de herramientas
            return {
              functionResponse: {
                name: call.name,
                response: { data: toolResult }   //A veces toolResult es un array, entonces lo envolvemos en un objeto para que siempre sea {}
              }
            };
          })
        );

        this.logger.log(`🔄 Datos recuperados de la BD. Enviando el lote completo a la IA...`);

        // 4. Segunda Llamada: Enviamos el historial completo respetando el protocolo multilote
        response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: prompt }] },
            // Enviamos las peticiones que hizo el modelo
            { role: 'model', parts: response.functionCalls.map(fc => ({ functionCall: fc })) },
            // Enviamos el array con todas las respuestas que ha recopilado nuestro backend
            { role: 'user', parts: functionResponses }
          ],
          config: {
            tools: tools
          }
        });
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
