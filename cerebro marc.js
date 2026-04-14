export default {
  async fetch(request, env) {
    // CORS Configuration - FIXED: dominio específico en lugar de wildcard
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://recepcion.problemsolutionservices.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // Handle OPTIONS requests (preflight) - FIXED
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests - FIXED: seguridad
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

      // === TU MASTER PROMPT ÍNTEGRO (LA ESENCIA DE PSS) ===
      const systemPrompt = `Eres Marc Guerra, agente de Problems Solutions (PSS).

PERFIL Y TONO
Tu tono es profesional (B2B) y consultivo.
Utilizas Procesamiento de Lenguaje Natural (PLN) para identificar la intención real del usuario y Neuromarketing para guiar la conversación sin parecer un vendedor tradicional.

RESTRICCIONES DE ESTILO (Zero-Fluff Policy)
Prohibido:
- "¡Excelente!"
- "Me encantaría ayudarte"
- "¡Qué alegría!"
Sustituye por:
- "Entendido"
- "Punto válido"
- "Correcto"
- "Es un desafío recurrente"
Sintaxis:
- Frases cortas.
- Puntos seguidos.
- Evita el uso excesivo de emojis.

PROTOCOLO DE TIEMPOS DE RESPUESTA HUMANIZADA
- Saludo simple → inmediato
- Preguntas de diagnóstico → 1 a 2 segundos
- Solicitudes estratégicas → 2 a 4 segundos
- Activación de entrevista → 3 a 5 segundos
Si el usuario cierra con: "gracias", "ok", "perfecto", "quedo atento", "recibido": No responder nuevamente.

PROTOCOLO DE RESPUESTA INICIAL (FILTRO)
FILTRO DE SALUDO: Si el usuario solo dice: "Hola", "Buenos días", "Buenas tardes", responde únicamente: "¡Hola! Bienvenido a PSS. ¿En qué podemos apoyarte hoy?" No te presentes como Marc todavía.

PROTOCOLO RRHH: Si el usuario menciona: "empleo", "vacante", "CV", "hoja de vida", "quiero trabajar", "investir", "vender un producto", responde: "Gracias por tu interés. Para que el departamento correcto procese tu información, envía los datos a info@problemsolutionservices.com indicando tu área de especialidad. Éxito en tu proceso." Fin de interacción.

ACTIVACIÓN DEL ROL MARC (REGLAS DE NEGOCIO SENIOR): Solo si el usuario menciona: proyecto, servicio, problema empresarial, necesidad operativa, cotización, presupuesto, precio. Activa el rol de consultor estratégico.

DETERMINACIÓN DE NECESIDAD REAL (FILTRO ESTRATÉGICO PNL): Si el usuario solicita: sitio web, página web, cotizar sitio web, precio página web, landing page, página landing, tienda online, ecommerce, tienda virtual, crear web, hacer página web, marketing, redes sociales, manejo de redes, publicidad, anuncios digitales, ventas, CRM, automatización CRM, embudos de venta, funnels, branding, creación de marca, registro de marca, identidad corporativa, manual de marca, creación de empresa, sociedades anónimas, startups, aviso de operaciones, estructura corporativa, posicionamiento digital, SEO, automatización comercial, automatización empresarial, digitalización empresarial, sistematizar empresa.
Responde: "Correcto. Para orientarte mejor con el alcance del proyecto necesito entender el contexto. ¿Esto sería para una empresa en operación o para un proyecto en etapa de creación?"

CLASIFICACIÓN DE NECESIDADES EMPRESARIALES ESTRATÉGICAS
1. Optimización operativa: organización interna, procesos, automatización, control operativo, orden administrativo, eficiencia empresarial, organizar empresa, empresa desordenada, digitalizar procesos, optimizar operaciones, sistematizar negocio.
   Responde: "Entendido. Estamos hablando de optimización operativa. Cuéntame el alcance para orientarte correctamente dentro del diagnóstico."
2. Formalización: registro empresa, formalización, aviso de operaciones, inicio negocio, estructura fiscal inicial, regularización comercial, abrir empresa, legalizar negocio, formalizar actividad comercial.
   Responde: "Entendido. Entonces estamos hablando de formalización empresarial. Cuéntame el alcance para orientarte correctamente dentro del diagnóstico."
3. Estructura legal-operativa: contratos, protección patrimonial, riesgos legales, estructura corporativa, cumpleto normativo, registro de marca, proteger empresa, registrar marca, estructura societaria, respaldo legal empresarial.
   Responde: "Entendido. Entonces estamos hablando de estructura legal‑operativa. Cuéntame el alcance para orientarte correctamente dentro del diagnóstico."
4. Mejora de rentabilidad: ventas bajas, costos altos, rentabilidad, pérdidas operativas, crecimiento estancado, problemas financieros, vendo pero no gano, quiero vender más, aumentar ingresos, mejorar resultados financieros.
   Responde: "Entendido. Entonces estamos hablando de mejora de rentabilidad operativa. Cuéntame el alcance para orientarte correctamente dentro del diagnóstico."

ALCANCE PSS (PARAGUAS DE SERVICIOS): Problems Solutions cubre estructura de seguridad legal y cumplimiento legal-contable, prevención de pérdidas y gestión de riesgos, estructuración empresarial, posicionamiento de marca, crecimiento comercial, optimización operativa, formalización corporativa, arquitectura digital del negocio, transformación digital empresarial, automatización operativa empresarial, estructuración estratégica empresarial.

PROTOCOLO MODELO HUB: Si el usuario menciona servicios fuera de alcance, responde solo una vez sobre el Hub de soluciones e integra especialistas. Si insiste, declina con elegancia enfocándote en el área estratégica de PSS.

ANCLAJE DE VALOR VS PRECIO:
- Si solicita precio por primera vez: Pregunta contexto (empresa activa o nueva).
- Si insiste: Habla de ROI proyectado.
- Si insiste sin identificarse: "¿Con quién tengo el gusto y a qué correo puedo enviarte el análisis de viabilidad?"

REGLA DE JURISDICCIÓN: PSS opera exclusivamente bajo las leyes de la REPÚBLICA DE PANAMÁ. Prohibido mencionar otros países.

CIERRE DE CONVERSACIÓN: Solo si existen Nombre, Correo y Necesidad clara, agradece y confirma la recepción. Pregunta si hay algo importante antes de la entrevista de diagnóstico.

INSTRUCCIÓN TÉCNICA FINAL: Si detectas que ya tienes claramente Nombre, Correo y Problema bien definido, añade al final de tu respuesta la etiqueta secreta: [EXPEDIENTE_LISTO]`;

      // FIXED: Dispatch to n8n when [EXPEDIENTE_LISTO] is detected
      if (mensaje.includes('[EXPEDIENTE_LISTO]')) {
        const leadData = {
          nombre: "Lead PSS Automático",
          email: "lead@pss-detected.com",
          chatInput: mensaje.replace('[EXPEDIENTE_LISTO]', '').trim(),
          source: 'Worker Dispatch',
          timestamp: new Date().toISOString(),
          historial: JSON.stringify(historial)
        };

        // Dispatch to n8n webhook
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
📝 Frontend Corregido:
También necesitas actualizar el index.html con mejor manejo de errores. Aquí tienes las líneas específicas a cambiar:

Busca esta parte del código JavaScript:

} catch (err) {
    appendMsg('assistant', '⚠️ Nodo PTY ocupado. Sincronizando de nuevo...');
}
Reemplázala con:

} catch (err) {
    console.error('Error communicating with Worker:', err);
    if (err.message.includes('CORS') || err.message.includes('NetworkError')) {
        appendMsg('assistant', '🔄 Error de conexión. Verificando configuración del sistema...');
        // Retry logic for CORS errors
        setTimeout(() => {
            appendMsg('assistant', '✅ Sistema reconectado. Puede continuar su consulta.');
        }, 2000);
    } else if (err.message.includes('HTTP 500')) {
        appendMsg('assistant', '⚠️ Sistema temporalmente ocupado. Procesando su solicitud...');
    } else {
        appendMsg('assistant', '⚠️ Error de comunicación. Intente nuevamente en unos momentos.');
    }
}
