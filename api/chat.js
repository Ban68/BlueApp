
import { GoogleGenerativeAI } from '@google/generative-ai';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google'; // Actually we might need @ai-sdk/google if using 'ai' sdk specifically, but let's stick to standard Vercel serverless pattern first with raw SDK if that fails, but Vercel AI SDK is best.
// Wait, 'ai' sdk usually works with specific providers. 
// Let's keep it simple: Standard Node.js handler using @google/generative-ai directly for maximum control over context injecting.

export const config = {
    runtime: 'edge',
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

    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `${buildContext()}\n\nUsuario: ${lastMessage}\nAsesor:`;

        const result = await model.generateContentStream(prompt);

        // Convert Gemini stream to text stream response
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    controller.enqueue(new TextEncoder().encode(chunkText));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
