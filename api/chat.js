import { GoogleGenerativeAI } from '@google/generative-ai';
import appContent from './content.json';

export const config = {
    runtime: 'edge',
};

// Helper: Safe JSON parse
const getAnswer = (jsonStr) => {
    try {
        if (typeof jsonStr !== 'string') return "";
        const parsed = JSON.parse(jsonStr);
        return parsed.answer || "";
    } catch (e) {
        return "";
    }
};

export default async function handler(req) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing." }), {
            status: 500,
            statusText: 'Configuration Error',
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { messages, image, mimeType } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        // Build Context
        let context = "Eres un experto asesor en inversiones de arándanos. Tu conocimiento se basa ESTRICTAMENTE en la siguiente información recuperada de notebooks técnicos y de mercado:\n\n";

        if (appContent.market_trends) context += `[MERCADO]: ${getAnswer(appContent.market_trends)}\n\n`;
        if (appContent.market_demand) context += `[DEMANDA]: ${getAnswer(appContent.market_demand)}\n\n`;
        if (appContent.market_risks) context += `[RIESGOS]: ${getAnswer(appContent.market_risks)}\n\n`;
        if (appContent.cultivation_guide) context += `[CULTIVO]: ${getAnswer(appContent.cultivation_guide)}\n\n`;
        if (appContent.varieties) context += `[VARIEDADES]: ${getAnswer(appContent.varieties)}\n\n`;
        if (appContent.pest_management) context += `[PLAGAS]: ${getAnswer(appContent.pest_management)}\n\n`;
        if (appContent.farm_checklist) context += `[CHECKLIST]: ${getAnswer(appContent.farm_checklist)}\n\n`;
        if (appContent.production_visit_tips) context += `[TIPS_VISITA]: ${getAnswer(appContent.production_visit_tips)}\n\n`;
        if (appContent.production_questions) context += `[PREGUNTAS_TECNICAS]: ${getAnswer(appContent.production_questions)}\n\n`;
        if (appContent.growing_visit_tips) context += `[TIPS_CRECIMIENTO]: ${getAnswer(appContent.growing_visit_tips)}\n\n`;

        context += "\n\n*** INSTRUCCIONES DE PERSONALIDAD (IMPORTANTE) ***";
        context += "\n1. ACTÚA como un consultor de negocios senior: sé BREVE (máximo 3-4 oraciones), directo y empático.";
        context += "\n2. ESTILO CONVERSACIONAL: No des discursos. Imagina que hablas por WhatsApp.";
        context += "\n3. NO 'VOMITES' DATOS: No sueltes estadísticas ni cifras a menos que te pregunten algo específico que lo requiera.";
        context += "\n4. FORMATO LIMPIO: Usa listas cortas (bullets) en lugar de párrafos largos.";
        context += "\n5. Si el usuario saluda, saluda de vuelta corto y pregunta qué le interesa ver hoy.";
        context += "\n6. BÁSATE en la información de arriba, pero no intentes resumirla toda de golpe.";
        context += "\n7. Si recibes una IMAGEN: Analízala detalladamente en busca de plagas, deficiencias o estado fenológico. Sé clínico y directo.";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        const promptText = `${context}\n\nUsuario: ${lastMessage}\nAsesor:`;

        // Multimodal Prompt Construction
        let promptParts = [promptText];
        if (image) {
            promptParts = [
                { inlineData: { mimeType: mimeType || 'image/jpeg', data: image } },
                { text: promptText }
            ];
        }

        const result = await model.generateContentStream(promptParts);

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        controller.enqueue(new TextEncoder().encode(chunkText));
                    }
                    controller.close();
                } catch (streamError) {
                    console.error("Stream Error:", streamError);
                    controller.error(streamError);
                }
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error("Generator Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Unknown AI Error" }), {
            status: 500,
            statusText: 'Internal Error',
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
