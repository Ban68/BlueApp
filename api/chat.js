import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    maxDuration: 60, // Allow longer timeouts for AI generation
};

// Load content relative to the function (Vercel builds flatten things, but let's try to pass it from frontend or hardcode/import it)
// Importing JSON in serverless function might work if bundled.
import appContent from '../src/data/app_content.json';

// Construct system prompt from appContent
const buildContext = () => {
    let context = "Eres un experto asesor en inversiones de arándanos. Tu conocimiento se basa ESTRICTAMENTE en la siguiente información recuperada de notebooks técnicos y de mercado:\n\n";

    // Add Market Info
    if (appContent.market_trends) context += `[MERCADO]: ${JSON.parse(appContent.market_trends).answer}\n\n`;
    if (appContent.market_demand) context += `[DEMANDA]: ${JSON.parse(appContent.market_demand).answer}\n\n`;
    if (appContent.market_risks) context += `[RIESGOS]: ${JSON.parse(appContent.market_risks).answer}\n\n`;

    // Add Technical Info
    if (appContent.cultivation_guide) context += `[CULTIVO]: ${JSON.parse(appContent.cultivation_guide).answer}\n\n`;
    if (appContent.varieties) context += `[VARIEDADES]: ${JSON.parse(appContent.varieties).answer}\n\n`;

    context += "\nResponde de manera concisa, profesional y alentadora. Si la respuesta no está en la información provista, di que no tienes esa información específica en tus registros actuales. NO inventes información.";
    return context;
};

export default async function handler(req) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing");
        return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing in Vercel." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `${buildContext()}\n\nUsuario: ${lastMessage}\nAsesor:`;

        const result = await model.generateContentStream(prompt);

        // Convert Gemini stream to text stream response
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
        return new Response(JSON.stringify({ error: error.message || "Unknown AI Error" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
