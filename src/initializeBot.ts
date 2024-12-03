import { addKeyword, createBot, createFlow, createProvider } from "@builderbot/bot";
import { MemoryDB as Database } from '@builderbot/bot';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';

const helloFlow = addKeyword(['hola'])
.addAnswer(`🙌 Hello welcome to this *Chatbot*`)

// Bot Initialization
export const initializeBot = async () => {
    const flow = createFlow([
        helloFlow
    ]);
    const provider = createProvider(Provider);
    const database = new Database();

    const { handleCtx, httpServer } = await createBot({
        flow,
        provider,
        database,
    });

    return { provider, handleCtx, httpServer };
    
};