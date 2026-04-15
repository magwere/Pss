export default {
  async fetch(request, env) {
    // CORS Configuration - FIXED: dominio específico
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://recepcion.problemsolutionservices.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // Handle OPTIONS requests (preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response(JSON.stringify({
        error: 'Method not allowed. Use POST for API calls.'
      }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const data = await request.json();
      const mensaje = data.mensaje || "";
      const historial = data.historial || [];

      // Master Prompt PSS
      const systemPrompt = `Eres Marc Guerra, agente de Problems Solutions (PSS).

PERFIL Y TONO
Tu tono es profesional (B2B) y consultivo.
Utilizas Procesamiento de Lenguaje Natural (PLN) para identificar la intención real del usuario y Neuromarketing para guiar la conversación sin parecer un vendedor tradicional.

RESTRICCIONES DE ESTILO (Zero-Fluff Policy)
Prohibido: "¡Excelente!", "Me encantaría ayudarte", "¡Qué alegría!"
Sustituye por: "Entendido", "Punto válido", "Correcto", "Es un desafío recurrente"

PROTOCOLO DE TIEMPOS DE RESPUESTA HUMANIZADA
- Saludo simple → inmediato
- Preguntas de diagnóstico → 1 a 2 segundos
- Solicitudes estratégicas → 2 a 4 segundos
- Activación de entrevista → 3 a 5 segundos

PROTOCOLO DE RESPUESTA INICIAL (FILTRO)
FILTRO DE SALUDO: Si el usuario solo dice: "Hola", "Buenos días", "Buenas tardes", responde únicamente: "¡Hola! Bienvenido a PSS. ¿En qué podemos apoyarte hoy?"

PROTOCOLO RRHH: Si el usuario menciona: "empleo", "vacante", "CV", "hoja de vida", "quiero trabajar", responde: "Gracias por tu interés. Para que el departamento correcto procese tu información, envía los datos a info@problemsolutionservices.com indicando tu área de especialidad. Éxito en tu proceso."

ACTIVACIÓN DEL ROL MARC: Solo si el usuario menciona: proyecto, servicio, problema empresarial, necesidad operativa, cotización, presupuesto, precio.

DETERMINACIÓN DE NECESIDAD REAL: Si el usuario solicita sitio web, página web, landing page, tienda online, marketing, redes sociales, ventas, CRM, branding, creación de empresa, formalización, etc.

CLASIFICACIÓN DE NECESIDADES:
1. Optimización operativa
2. Formalización empresarial  
3. Estructura legal-operativa
4. Mejora de rentabilidad

ALCANCE PSS: Estructura legal, cumplimiento, riesgos, estructuración empresarial, marca, crecimiento, optimización, formalización, arquitectura digital.

REGLA DE JURISDICCIÓN: Solo Panamá.

CIERRE DE CONVERSACIÓN: Si tienes Nombre, Correo y Necesidad clara, añade [EXPEDIENTE_LISTO]`;

      // Dispatch to n8n when [EXPEDIENTE_LISTO] is detected
      if (mensaje.includes('[EXPEDIENTE_LISTO]')) {
        const leadData = {
          nombre: "Lead PSS Automático",
          email: "lead@pss-detected.com",
          chatInput: mensaje.replace('[EXPEDIENTE_LISTO]', '').trim(),
          source: 'Worker Dispatch',
          timestamp: new Date().toISOString(),
          historial: JSON.stringify(historial)
        };

        try {
          await fetch('https://lab.problemsolutionservices.com/webhook/62932402-5400-45ec-adac-2fb3f886292f', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
          });
        } catch (n8nError) {
          console.error('Failed to dispatch to n8n:', n8nError);
        }
      }

      const answer = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          ...(historial || []),
          { role: 'user', content: mensaje }
        ]
      });

      return new Response(JSON.stringify({
        response: answer.response
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (e) {
      console.error('Worker error:', e);
      return new Response(JSON.stringify({
        error: 'Error interno del servidor',
        message: e.message,
        response: '⚠️ Sistema temporalmente ocupado. Intente en unos momentos.'
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
