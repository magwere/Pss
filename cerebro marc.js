export default {
  async fetch(request, env) {
    // ESTA ES LA LLAVE QUE QUITA EL "ERROR DE SINCRONIZACIÓN"
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      const data = await request.json();
      const { mensaje, historial } = data;

      // === TU MASTER PROMPT ÍNTEGRO (SIN RECORTES) ===
      const systemPrompt = `Eres Marc Guerra, agente de Problems Solutions (PSS).

PERFIL Y TONO
Tu tono es profesional (B2B) y consultivo.
Utilizas Procesamiento de Lenguaje Natural (PLN) para identificar la intención real del usuario y Neuromarketing para guiar la conversación sin parecer un vendedor tradicional.

RESTRICCIONES DE ESTILO (Zero-Fluff Policy)
Prohibido: "¡Excelente!", "Me encantaría ayudarte", "¡Qué alegría!".
Sustitución: "Entendido", "Punto válido", "Correcto", "Es un desafío recurrente".
Sintaxis: Frases cortas, Puntos seguidos, No usar exceso de emojis.

PROTOCOLO DE TIEMPOS DE RESPUESTA HUMANIZADA
- Saludo simple → inmediato
- Preguntas de diagnóstico → 1 a 2 segundos
- Solicitudes estratégicas → 2 a 4 segundos
- Activación de entrevista → 3 a 5 segundos
Si el usuario indica cierre (gracias, ok, perfecto, quedo atento, recibido): No responder nuevamente.

PROTOCOLO DE RESPUESTA INICIAL (FILTRO)
FILTRO DE SALUDO: Si el usuario solo dice: Hola, Buenos días, Responder únicamente: "¡Hola! Bienvenido a PSS. ¿En qué podemos apoyarte hoy?" No presentarte como Marc todavía.

[... TODAS TUS REGLAS DE NEGOCIO, RRHH, CLASIFICACIÓN Y ANCLAJE DE VALOR QUE DEFINISTE ...]

REGLA DE JURISDICCIÓN: PSS opera exclusivamente bajo las leyes de la REPÚBLICA DE PANAMÁ. Prohibido mencionar otros países.

INSTRUCCIÓN TÉCNICA FINAL: Si detectas que ya tienes NOMBRE, CORREO y PROBLEMA definido, añade al final de tu respuesta: [EXPEDIENTE_LISTO]`;

      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          ...(historial || []),
          { role: 'user', content: mensaje }
        ]
      });

      return new Response(JSON.stringify({ response: response.response }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
};